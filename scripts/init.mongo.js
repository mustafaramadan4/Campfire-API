/* global db print */
/* eslint no-restricted-globals: "off" */
// db.contacts.remove({});
//db.deleted_contacts.remove({});

const count = db.contacts.count();
print('There are now', count, 'contacts');

// db.counters.remove({ _id: 'contacts' });
// db.counters.insert({ _id: 'contacts', current: count });

db.contacts.createIndex({ id: 1 }, { unique: true });
db.contacts.createIndex({ activeStatus: 1 });
db.contacts.createIndex({ name: 1 });
db.contacts.createIndex({ nextContactDate: 1 });
db.contacts.createIndex({ contactFrequency: 1 });
db.contacts.createIndex({ name: 'text', notes: 'text' });

// db.deleted_issues.createIndex({ id: 1 }, { unique: true });
