This documnent serves as a representation of the CRUD operations performed with GraphQL. 
- Please note that the GraphQL schema defined in the  `schema.graphql` file.



#### Dashboard Filter (Read)

Dashboard view query for all contacts with specified days ahead of `nextContactDate`:

```query contactList(
  $page: Int
  $nextContactDate: GraphQLDate
  $daysAhead: Int
  $ownerEmail: String
) {
  contactList(
    page: $page
    nextContactDate: $nextContactDate
    daysAhead: $daysAhead
    ownerEmail: $ownerEmail
  ) {
    contacts {
      id
      name
      company
      title
      contactFrequency
      email
      phone
      LinkedIn
      priority
      familiarity
      contextSpace
      activeStatus
      lastContactDate
      nextContactDate
      notes
    }
    pages
  }
}
```
Sample Dashboard Filter Query:
![Dashboard Filter Query](https://github.ccs.neu.edu/NEU-CS5610-SU20/GroupProject_jsonStatham_API/blob/master/ReadmeImages/DashboardFilterQuery.png)


#### Contact Add (Create)

ContactAdd mutation:

```
mutation contactAdd($contact: ContactInputs!) {
  contactAdd(contact: $contact) {
    id
    name
    email
    phone
    LinkedIn
    lastContactDate
  }
}
```


#### Contact Edit (Read/Update)

Contact Edit Query:
```
query contact($id: Int!) {
  contact(id: $id) {
    id
    name
    company
    title
    contactFrequency
    email
    phone
    LinkedIn
    priority
    familiarity
    contextSpace
    activeStatus
    lastContactDate
    nextContactDate
    notes
  }
}
```
Sample  Contact Edit Query:
![Edit Contact Query](https://github.ccs.neu.edu/NEU-CS5610-SU20/GroupProject_jsonStatham_API/blob/master/ReadmeImages/EditContactQuery.png)


Contact Edit Mutation on Submit:

```
mutation contactUpdate($id: Int!, $changes: ContactUpdateInputs!) {
  contactUpdate(id: $id, changes: $changes) {
    id
    name
    company
    title
    contactFrequency
    email
    phone
    LinkedIn
    priority
    familiarity
    contextSpace
    activeStatus
    lastContactDate
    nextContactDate
    notes
  }
}
```

#### Contact List (Read/Update/Delete)

Contact List View Query for All contacts that are of the signed-in user (ownerEmail):

```
query contactList(
  $ownerEmail: String
  $contactFrequency: frequency
  $priority: priority
  $familiarity: familiarity
  $activeStatus: Boolean
  $page: Int
  $hasSelection: Boolean!
  $selectedId: Int!
) {
  contactList(
    ownerEmail: $ownerEmail
    activeStatus: $activeStatus
    familiarity: $familiarity
    priority: $priority
    contactFrequency: $contactFrequency
    page: $page
  ) {
    contacts {
      id
      name
      company
      title
      contactFrequency
      email
      phone
      LinkedIn
      priority
      familiarity
      contextSpace
      activeStatus
    }
    pages
  }
  contact(id: $selectedId) @include(if: $hasSelection) {
    id
    name
    LinkedIn
    phone
    contextSpace
    activeStatus
    lastContactDate
    nextContactDate
    notes
  }
}
```

Mutation for Activation/Inactivation of a contact in the Contact List View:

```
mutation toggleActiveStatus($id: Int!) {
  contactUpdate(
    id: $id
    changes: { activeStatus: false, nextContactDate: null }
  ) {
    id
    name
    company
    title
    contactFrequency
    email
    phone
    LinkedIn
    priority
    familiarity
    contextSpace
    activeStatus
    lastContactDate
    nextContactDate
    notes
  }
}
```

Mutation for Deletion of a contact in the Contact List View:

```
mutation contactDelete($id: Int!) {
  contactDelete(id: $id)
}
```


Mutation for Undo Operation of contact deletion in the Contact List View:
```
mutation contactRestore($id: Int!) {
  contactRestore(id: $id)
}

```
