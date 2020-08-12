const { UserInputError } = require('apollo-server-express');
const { getDb, getNextSequence } = require('./db.js');
const { mustBeSignedIn } = require('./auth.js');

async function getContact(_, { id }) {
  const db = getDb();
  
  const contact = await db.collection('contacts').findOne({ id });
  return contact;
}

const PAGE_SIZE = 10;

async function listContact(_, {
  // parallel to Dashboard.jsx Line 39, passing on vars.
  ownerEmail, activeStatus, contactFrequency,
  priority, familiarity, nextContactDate, daysAhead, search, page
}) {
  const db = getDb();
  const filter = {};
  // if a field is passed in as query param, add it to the list of filters
  // for ownerEmail, setit to some string * so that it doesn't match anything
  if(ownerEmail!==null && ownerEmail!==undefined) { 
    filter.ownerEmail = ownerEmail;
  } else {filter.ownerEmail = "*"}
  if (activeStatus!==undefined) filter.activeStatus = activeStatus;
  if (contactFrequency!==undefined) filter.contactFrequency = contactFrequency;
  if (priority!==undefined) filter.priority = priority;
  if (familiarity!==undefined) filter.familiarity = familiarity;
  // SHH - Filter used in Dashboard.jsx to display nextContactDates that are due/
  // E.g. dates that are (<=) to today.
  if (nextContactDate!==undefined) {
    const filterDate = new Date(new Date().getTime() + (1000 * 60 * 60 * 24 * daysAhead));
    filter.nextContactDate = { $lte: filterDate };
  }

  if (search) filter.$text = { $search: search };

  const cursor = db.collection('contacts').find(filter)
  .sort({ name: 1})
  .skip(PAGE_SIZE * (page - 1))
  .limit(PAGE_SIZE);
  const totalCount = await cursor.count(false);
  const contacts = cursor.toArray();
  const pages = Math.ceil(totalCount / PAGE_SIZE);
  return { contacts, pages };
}

function validateContact(contact) {
  const errors = [];
  if (contact.name !== null && contact.name.length < 3) {
    errors.push('Field "name" must be at least 3 characters long.');
  }
  if ((contact.email === null &&
    contact.phone === null &&
    contact.LinkedIn === null) ||
    (contact.email.length === 0 &&
      contact.phone.length === 0 &&
      contact.LinkedIn.length === 0)) {
    errors.push('At least one contact mean should be provided.');
  }
  if(contact.email !== null && contact.email.length > 0) {
    let mailformat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if(!contact.email.match(mailformat)) {
      errors.push('You have entered an invalid email address!');
    }
  }

  if(contact.LinkedIn !== null && contact.LinkedIn.length > 0) {
    if(!contact.LinkedIn.includes("linkedin.com/")) {
      errors.push('You have entered an invalid linkedin address!');
    }
  }
  if (errors.length > 0) {
    throw new UserInputError('Invalid input(s)', { errors });
  }
}

const WEEKLY = 7;
const BIWEEKLY = 14;
let MONTHLY = 31;
const QUARTERLY = 91;
const BIANNUAL = 182;
const YEARLY = 365;

function dateTemplate(baseDate, days) {
  return new Date(baseDate.getTime() + 1000 * 60 * 60 * 24 * days);
}

/* Helper function to generate all dates required
 * @param frequency : contactFrequency
 * @param baseDate: a Date object used as base to generate new date
 * @return : New Date() object
 */
function generateDates(frequency, baseDate) {
  let nextDate;
  switch(frequency) {
    case "Weekly":
      nextDate = dateTemplate(baseDate, WEEKLY);
      break;
    case "Biweekly":
      nextDate = dateTemplate(baseDate, BIWEEKLY);
      break;
    case "Monthly":
      switch(baseDate.getMonth()) {
        // DONE: implement monthly to 30 or 31 depending on the month.
        // For some reason the getMonth() gives an integer one less than the actual month value,
        // e.g. December gives 11, so I just hard coded the cases around it :p
        case 1:
        case 3:
        case 5:
        case 8:
        case 10:
          MONTHLY = 30;
          break;
      }
      nextDate = dateTemplate(baseDate, MONTHLY);
      break;
    case "Quarterly":
      nextDate = dateTemplate(baseDate, QUARTERLY);
      break;
    case "Biannual":
      nextDate =dateTemplate(baseDate, BIANNUAL);
      break;
    case "Yearly":
      nextDate = dateTemplate(baseDate, YEARLY);
      break;
  }
  return nextDate;
}

/*
* DONE: Implmented a function to set the nextContactDate as a function of
* the activeStatus, contactFrequency, and the lastContactDate but it's more complicated that I thought.
* 1. If there's no change in the already active status, set next date based on the last date. DONE
* 2. If there's no change in the inactive status, don't do anything.
* 3. If the active status goes from inactive to active, set next date based on today's date. DONE
* 4. If the active status goes from active to inactive, don't do anything.
*/
function setNextContactDate(contact, turnedActive, manualDateChange, newActiveStatus) {
  let nextDate;
  if (manualDateChange === false) {
    // already active contact, setting the next date based on the last date.
    if (contact.activeStatus === true && !turnedActive) {
      let lastDate = new Date(contact.lastContactDate);
      if (!contact.lastContactDate) { lastDate = new Date(); }
      // Generate the date using last contac Date
      nextDate = generateDates(contact.contactFrequency, lastDate);
      // If the new Date is in the past, set the base date as today and recalculate
      if(nextDate < new Date()) {
        nextDate = generateDates(contact.contactFrequency, new Date());
      }
    } else if (turnedActive === true) {
    // when the user now turns on the active status, set the next date from today's date.
      // Call generate date using today as the base
      nextDate = generateDates(contact.contactFrequency, new Date());
    }
  } else {  // if manualDateChange is true, don't modify the contactNextDate
    nextDate = contact.nextContactDate;
    // Custom Frequency and activeStatus is False, set date to null
    if(contact.activeStatus === false) {
      nextDate = null;
    }
  }
  return {nextDate, newActiveStatus};
}

async function addContact(_, { contact }) {
  const db = getDb();
  // Added validation method for name and contact info (validate email)
  validateContact(contact);

  const newContact = Object.assign({}, contact);
  // Object.assign creates a copy to the source from the target
  newContact.id = await getNextSequence('contacts');

  const result = await db.collection('contacts').insertOne(newContact);
  const savedContact = await db.collection('contacts')
    .findOne({ _id: result.insertedId });
  return savedContact;
}

async function updateContact(_, { id, changes }) {
  const db = getDb();
  if (changes.contactFrequency || changes.email
      || changes.notes || changes.activeStatus || changes.name
      || changes.name || changes.company || changes.title ||changes.phone
      || changes.LinkedIn || changes.priority || changes.familiarity
      || changes.contextSpace) {
    const contact = await db.collection('contacts').findOne({ id });
    /* DONE: checked if the active status changed from inactive to active,
     * then pass a boolean to setNextContactDate.
    */
    let current = contact.activeStatus;  // old status
    let news = changes.activeStatus;   // new status
    let activated = false;  // Bool variable to hold whether status activated
    if(current === false && news === true) {
      activated = true;
    }
    let manualDateChange = false;
    if (contact.nextContactDate !== null && changes.nextContactDate !== null) {
      if (contact.nextContactDate.getTime() !== changes.nextContactDate.getTime()) {
        manualDateChange = true;
      }
    }
    if (contact.contactFrequency === "Custom" && changes.contactFrequency === "Custom") {
      manualDateChange = true;
    }
    Object.assign(contact, changes);

    const { nextDate, newActiveStatus } = setNextContactDate(contact, activated, manualDateChange, news);
    changes.nextContactDate = nextDate;
    changes.activeStatus = newActiveStatus;
    validateContact(contact);
  }
  await db.collection('contacts').updateOne({ id }, { $set: changes });
  const savedContact = await db.collection('contacts').findOne({ id });
  return savedContact;
}

async function removeContact(_, { id }) {
  const db = getDb();
  const contact = await db.collection('contacts').findOne({ id });
  if (!contact) return false;
  contact.deleted = new Date();

  let result = await db.collection('deleted_contacts').insertOne(contact);
  if (result.insertedId) {
    result = await db.collection('contacts').removeOne({ id });
    return result.deletedCount === 1;
  }
  return false;
}

async function restoreContact(_, { id }) {
  const db = getDb();
  const contact = await db.collection('deleted_contacts').findOne({ id });
  if (!contact) return false;
  contact.deleted = new Date();

  let result = await db.collection('contacts').insertOne(contact);
  if (result.insertedId) {
    result = await db.collection('deleted_contacts').removeOne({ id });
    return result.deletedCount === 1;
  }
  return false;
}

module.exports = {
  listContact,
  getContact,
  addContact: mustBeSignedIn(addContact),
  updateContact: mustBeSignedIn(updateContact),
  removeContact: mustBeSignedIn(removeContact),
  restoreContact: mustBeSignedIn(restoreContact),
};
