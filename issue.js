const { UserInputError } = require('apollo-server-express');
const { getDb, getNextSequence } = require('./db.js');
const { mustBeSignedIn } = require('./auth.js');

async function get(_, { id }) {
  const db = getDb();

  const issue = await db.collection('issues').findOne({ id });
  return issue;
}

async function getContact(_, { id }) {
  const db = getDb();
  
  const contact = await db.collection('contacts').findOne({ id });
  return contact;
}

const PAGE_SIZE = 10;

async function list(_, {
  status, effortMin, effortMax, search, page,
}) {
  const db = getDb();
  const filter = {};

  if (status) filter.status = status;

  if (effortMin !== undefined || effortMax !== undefined) {
    filter.effort = {};
    if (effortMin !== undefined) filter.effort.$gte = effortMin;
    if (effortMax !== undefined) filter.effort.$lte = effortMax;
  }
  if (search) filter.$text = { $search: search };

  const cursor = db.collection('issues').find(filter)
    .sort({ id: 1 })
    .skip(PAGE_SIZE * (page - 1))
    .limit(PAGE_SIZE);

  const totalCount = await cursor.count(false);
  const issues = cursor.toArray();
  const pages = Math.ceil(totalCount / PAGE_SIZE);
  return { issues, pages };
}

async function listContact(_, { activeStatus, search, page }) {
  // it accepts activeStatus as an optional filter param
  const db = getDb();
  const filter = {};
  // if activeStatus is passed in as query param, add it to the list of filters
  if (activeStatus!==undefined) filter.activeStatus = activeStatus;
  //console.log("filter: " + filter);

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

function validate(issue) {
  const errors = [];
  if (issue.title.length < 3) {
    errors.push('Field "title" must be at least 3 characters long.');
  }
  if (issue.status === 'Assigned' && !issue.owner) {
    errors.push('Field "owner" is required when status is "Assigned"');
  }
  if (errors.length > 0) {
    throw new UserInputError('Invalid input(s)', { errors });
  }
}

// Included phone validation
function validateContact(contact) {
  const errors = [];
  if (contact.name.length < 3) {
    errors.push('Field "name" must be at least 3 characters long.');
  }
  if (contact.email.length === 0 && contact.phone.length === 0
    && contact.LinkedIn.length === 0) {
    errors.push('At least one contact mean should be provided.');
  }
  if(contact.email.length > 0) {
    let mailformat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if(!contact.email.match(mailformat)) {
      errors.push('You have entered an invalid email address!');
    }
  }
  if(contact.phone.length > 0) {
    let phoneformat = /^\d{10}$/;
    if(!contact.phone.match(phoneformat)) {
      errors.push('Phone number should be 10 digits!');
    }
  }
  if(contact.LinkedIn.length > 0) {
    if(!contact.LinkedIn.includes("linkedin.com/")) {
      errors.push('You have entered an invalid linkedin adress!');
    }
  }
  if (errors.length > 0) {
    throw new UserInputError('Invalid input(s)', { errors });
  }
}

async function add(_, { issue }) {
  const db = getDb();
  validate(issue);

  const newIssue = Object.assign({}, issue);
  newIssue.created = new Date();
  newIssue.id = await getNextSequence('issues');

  const result = await db.collection('issues').insertOne(newIssue);
  const savedIssue = await db.collection('issues')
    .findOne({ _id: result.insertedId });
  return savedIssue;
}

/*
* DONE: Implmented a function to set the nextContactDate as a function of
* the activeStatus, contactFrequency, and the lastContactDate but it's more complicated that I thought.
* 1. If there's no change in the already active status, set next date based on the last date. DONE
* 2. If there's no change in the inactive status, don't do anything.
* 3. If the active status goes from inactive to active, set next date based on today's date. DONE
* 4. If the active status goes from active to inactive, don't do anything.
*/
function setNextContactDate(contact, turnedActive) {
  // if there is no change in active status, set next date based on the last date.
  // TODO: can this be compatible with a reconnect behavior? -> reconnect will set the lastContactDate to today's date,
  // and I'm setting the nextContactDate from that lastContactDate, so it should be okay.
  // DONE: Initialized lastDate variable as the lastContactDate.
  let nextDate;
  if (contact.activeStatus === true && !turnedActive) {
    let lastDate = new Date(contact.lastContactDate);
    if (!contact.lastContactDate) { lastDate = new Date(); }
    switch(contact.contactFrequency) {
      case "Weekly":
        nextDate = new Date(lastDate.getTime() + 1000 * 60 * 60 * 24 * 7);
        break;
      case "Biweekly":
        nextDate = new Date(lastDate.getTime() + 1000 * 60 * 60 * 24 * 14);
        break;
      case "Monthly":
        nextDate = new Date(lastDate.getTime() + 1000 * 60 * 60 * 24 * 30);
        break;
      case "Quarterly":
        nextDate = new Date(lastDate.getTime() + 1000 * 60 * 60 * 24 * 91);
        break;
      case "Biannual":
        nextDate = new Date(lastDate.getTime() + 1000 * 60 * 60 * 24 * 182);
        break;
      case "Yearly":
        nextDate = new Date(lastDate.getTime() + 1000 * 60 * 60 * 24 * 365);
        break;
      case "None":
    }
  } else if (turnedActive === true) {
  // when the user now turns on the active status, set the next date from today's date.
    switch(contact.contactFrequency) {
      case "Weekly":
        nextDate = new Date(new Date().getTime() + 1000 * 60 * 60 * 24 * 7);
        break;
      case "Biweekly":
        nextDate = new Date(new Date().getTime() + 1000 * 60 * 60 * 24 * 14);
        break;
      case "Monthly":
        nextDate = new Date(new Date().getTime() + 1000 * 60 * 60 * 24 * 30);
        break;
      case "Quarterly":
        nextDate = new Date(new Date().getTime() + 1000 * 60 * 60 * 24 * 91);
        break;
      case "Biannual":
        nextDate = new Date(new Date().getTime() + 1000 * 60 * 60 * 24 * 182);
        break;
      case "Yearly":
        nextDate = new Date(new Date().getTime() + 1000 * 60 * 60 * 24 * 365);
        break;
      case "None":
    }
  }
  console.log(nextDate);
  return nextDate; 
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

async function update(_, { id, changes }) {
  const db = getDb();
  if (changes.title || changes.status || changes.owner) {
    const issue = await db.collection('issues').findOne({ id });
    Object.assign(issue, changes);
    validate(issue);
  }
  await db.collection('issues').updateOne({ id }, { $set: changes });
  const savedIssue = await db.collection('issues').findOne({ id });
  return savedIssue;
}

async function updateContact(_, { id, changes }) {
  const db = getDb();
  if (changes.contactFrequency || changes.email
      || changes.notes || changes.activeStatus || changes.name
      || changes.name || changes.company || changes.title ||changes.phone
      || changes.Linkedin || changes.priority || changes.familiarity
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
    Object.assign(contact, changes);
    // this will set the nextContacDate when activating/deactivating a contact
    // from either the Edit view or the "on/off" button in Contacts view.
    changes.nextContactDate = setNextContactDate(contact, activated);
    validateContact(contact);
  }
  await db.collection('contacts').updateOne({ id }, { $set: changes });
  const savedContact = await db.collection('contacts').findOne({ id });
  return savedContact;
}

async function remove(_, { id }) {
  const db = getDb();
  const issue = await db.collection('issues').findOne({ id });
  if (!issue) return false;
  issue.deleted = new Date();

  let result = await db.collection('deleted_issues').insertOne(issue);
  if (result.insertedId) {
    result = await db.collection('issues').removeOne({ id });
    return result.deletedCount === 1;
  }
  return false;
}

// Implemented RemoveContact
async function removeContact(_, { id }) {
  const db = getDb();
  const issue = await db.collection('contacts').findOne({ id });
  if (!issue) return false;
  issue.deleted = new Date();

  let result = await db.collection('deleted_contacts').insertOne(issue);
  if (result.insertedId) {
    result = await db.collection('contacts').removeOne({ id });
    return result.deletedCount === 1;
  }
  return false;
}

// Implemented RestoreContact
async function restoreContact(_, { id }) {
  const db = getDb();
  const issue = await db.collection('deleted_contacts').findOne({ id });
  if (!issue) return false;
  issue.deleted = new Date();

  let result = await db.collection('contacts').insertOne(issue);
  if (result.insertedId) {
    result = await db.collection('deleted_contacts').removeOne({ id });
    return result.deletedCount === 1;
  }
  return false;
}

async function restore(_, { id }) {
  const db = getDb();
  const issue = await db.collection('deleted_issues').findOne({ id });
  if (!issue) return false;
  issue.deleted = new Date();

  let result = await db.collection('issues').insertOne(issue);
  if (result.insertedId) {
    result = await db.collection('deleted_issues').removeOne({ id });
    return result.deletedCount === 1;
  }
  return false;
}

async function counts(_, { status, effortMin, effortMax }) {
  const db = getDb();
  const filter = {};

  if (status) filter.status = status;

  if (effortMin !== undefined || effortMax !== undefined) {
    filter.effort = {};
    if (effortMin !== undefined) filter.effort.$gte = effortMin;
    if (effortMax !== undefined) filter.effort.$lte = effortMax;
  }

  const results = await db.collection('issues').aggregate([
    { $match: filter },
    {
      $group: {
        _id: { owner: '$owner', status: '$status' },
        count: { $sum: 1 },
      },
    },
  ]).toArray();

  const stats = {};
  results.forEach((result) => {
    // eslint-disable-next-line no-underscore-dangle
    const { owner, status: statusKey } = result._id;
    if (!stats[owner]) stats[owner] = { owner };
    stats[owner][statusKey] = result.count;
  });
  return Object.values(stats);
}

module.exports = {
  list,
  add: mustBeSignedIn(add),
  get,
  update: mustBeSignedIn(update),
  delete: mustBeSignedIn(remove),
  restore: mustBeSignedIn(restore),
  counts,

  listContact,
  addContact,
  getContact,
  updateContact,
  removeContact,
  restoreContact,
};
