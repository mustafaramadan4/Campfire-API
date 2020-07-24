/* global db print */
/* eslint no-restricted-globals: "off" */
db.contacts.remove({});
//db.deleted_contacts.remove({});

const count = db.contacts.count();
print('There are now', count, 'contacts');

db.counters.remove({ _id: 'contacts' });
db.counters.insert({ _id: 'contacts', current: count });

db.issues.createIndex({ id: 1 }, { unique: true });
db.issues.createIndex({ activeStatus: 1 });
db.issues.createIndex({ name: 1 });
db.issues.createIndex({ nextContactDate: 1 });
db.issues.createIndex({ contactFrequency: 1 });
db.issues.createIndex({ title: 'text', description: 'text' });

db.deleted_issues.createIndex({ id: 1 }, { unique: true });
