/*
Run using the mongo shell. For remote databases, ensure that the connection string
is supplied in the command line. For example:
localhost:
    mongo campfire scripts/init.mongo.js
Atlas:
    mongo mongodb+srv://user:pwd@xxx.mongodb.net/campfire scripts/init.mongo.js
*/


/* global db print */
/* eslint no-restricted-globals: "off" */
// db.contacts.remove({});
//db.deleted_contacts.remove({});

// const count = db.contacts.count();
// print('There are now', count, 'contacts');

// db.counters.remove({ _id: 'contacts' });
// db.counters.insert({ _id: 'contacts', current: count });



db.contacts.remove({});
db.deleted_contacts.remove({});

const contactsDB = [
  {
    id: 1,
    name: 'Test Person1',
    contactFrequency: 'Monthly',
    email: "testperson@website.com",
    phone: "1234567890",
    LinkedIn:"https://www.linkedin.com/in/Agnesse Caigg",
    priority: "medium",
    familiarity: "meaningful",
    contextSpace: "Tech",
    activeStatus: true,
    lastContactDate: new Date('2020-07-15'),
    notes: "Lorem ipsum imet llalalala",
    company: "Amazon",
    nextContactDate: new Date('2020-08-15'),
    title: "Technical Program Manager",
    ownerEmail: "pedrocantu@gmail.com",
  },
  {
    id: 2,
    name: 'Test Person2',
    contactFrequency: 'Weekly',
    email: "testperson@gmail.com",
    phone: "0123456789",
    LinkedIn:"https://www.linkedin.com/in/person",
    priority: "medium",
    familiarity: "meaningful",
    contextSpace: "Business",
    activeStatus: true,
    lastContactDate: new Date(),
    notes: "Lorem ipsum imet asdlkfjhasdkfjs",
    company: "Deloitte",
    nextContactDate: new Date(new Date().getTime() + 1000 * 60 * 60 * 24 * 7),
    title: "Technical Program Manager",
    ownerEmail: "shristov22@gmail.com"
  },
];

db.contacts.insertMany(contactsDB);
const count = db.contacts.count();
print('Inserted', count, 'contacts');

db.counters.remove({ _id: 'contacts' });
db.counters.insert({ _id: 'contacts', current: count });

db.contacts.createIndex({ id: 1 }, { unique: true });
db.contacts.createIndex({ activeStatus: 1 });
db.contacts.createIndex({ name: 1 });
db.contacts.createIndex({ nextContactDate: 1 });
db.contacts.createIndex({ contactFrequency: 1 });
db.contacts.createIndex({ ownerEmail: 1 });
db.contacts.createIndex({ name: 'text', notes: 'text' });

db.deleted_contacts.createIndex({ id: 1 }, { unique: true });
