# GroupProject_jsonStatham_API

<h2>Campfire:</h2>
<h3> Group Members: Pedro Cantu, Stefan Hristov, Mustafa Ramadan, Heejun You </h3>
You are currenly on the API repository for project Campfire. 

<b>API Repository:</b> https://github.ccs.neu.edu/NEU-CS5610-SU20/GroupProject_jsonStatham_API

The corresponding repository for the <b>UI</b> of this Campfire project is: https://github.ccs.neu.edu/NEU-CS5610-SU20/GroupProject_jsonStatham_UI

Our group project is called <b>Campfire</b>. The purpose of this web application is for a user to log into the webapp, and be able to add "contacts" into their personalized address book, and be able to set frequencies for how often they would like to reconnect with their contacts. Thus by using this webapp, the user will always be reconnecting with contacts in accordance to how often they want to reconnect with them. Forgetfulness is no longer a factor when using Campfire. The basis of this project has been created using the boilerplate code used from the MERN Stack Issue Tracker Book Project by Vasan Subramanian.

<h2> Iteration 1.0: </h2>
<b>In this iteration, the following was implemented. </b>

The user has the ability to perform CRUD operations in this webapplication which will be defined below.

- <b>Create:</b> The user once logged in has the ability to to create a contact on the top right (plus) icon of the navigation bar, and this will render a popup page which allows the user to input field such as name, as well as a required 1 of 3 contact information pieces (email, phonenumber, or linkedin). Each of these contact information fields have an implemented validation that must occur when the user inputs the data. For example, the linkedin field must require an input that contains the string "linkedin". 









ce the user creates the contact, it will render the edit page specific to that contact id created, and the user now has the ability to further add in more information and set a frequency date. The contact will now be set as "active" and the "last contact date" will be set as the date it was created.

- <b>Read:</b> The user can view all of their contacts in the Contacts tab on the navigation bar. Upon this display, the user can view their contacts view all the field names described in our schema. These field names include: Name, Company, Title, Frequency, Email, LinkedIn, Priority, Familiarity, Context, Active Status.

- <b>Update:</b> The user has the ability to access all contacts in their personalized contact book from the Contacts tab on the navigation bar. Once doing so, each contact will display an edit button to the right of their name, and by the user clicking on the edit button, the user will now have that chosen contacts edit page rendered on the screen. Any of the contacts fields can now be manipulated and resaved.  
There's a considerable amount of logic involved in setting the nextContactDate for a specific contact, as it is a function of the activeStatus of the contact, contactFrequency the user selects, and the lastContactDate of the contact.
  1. If there's no change in the already active status, set next date based on the last date.  
    Do check if the newly set next date is in the past (from today's date) and if is, set the next date based on today's date.
  1. If there's no change in the inactive status, don't do anything.
  1. If the active status goes from inactive to active, set next date based on today's date.
  1. If the active status goes from active to inactive, clear the nextContactDate.
  1. Let the user choose a custom date he wants overriding the newContactDate that would be set from lastContactDate.

- <b>Delete:</b> On the Contacts tab of the navigation bar, the user has the ability to delete any contact they no longer want. This can be done in the far right column on the Contacts page, i.e. Edit column. In the "Edit" column, the user will find an "Edit" button, an "Active/Inactive" Toggler, and a "Delete" button. The delete button when clicked will prompt a Toast message if a succesfful deletion of the contact occured. Also, similarly to delete, our web application implements an active status for each user. This allows the user to filter on contacts they still consider "active" and are wanting to reconnect with. Thus, the active/inactive toggler will update the specified contacts active status which in turn if "inactive" will set the "Next Contact Date" to null.

In addition to the CRUD operations, our web application is set up as follows. The navigation bar currently contains 4 tabs:
- <b>Home page:</b> redirects to the Dashboard page

- <b>Dashboard:</b> Disclaimer- Not fully implemented. But the idea is that the user's upcoming reminders (which could be remidners that are occuring within the week or day) will render on the Dashboard page. And upon clicking on the Reconnect button, this will reset the "Last Contact Date" to the present day the "Reconnect" button was clicked and reupdate the "Next Contact Date". And allows the user to update any information on that specific contact. This in turn will likely render that contact off of the dashboard page as the dashboard page assesses the upcoming contacts based off of "Next Contact Date".

- <b>Contacts:</b> Includes all of the user's contacts they've set on this page. The page render 10 contacts at a time, and a next/prev navigation button is located on the button of the page. The contacts page displays the user's contacts according to fields described above. In addition to the display as well as interactivity from the user in the form of the "Edit" button, "Active/Inactive Toggler", "Delete" button, the user has the ability to also filter which is found directly underneath the navigation bar. The user can filter via Active Status (Active/Inactive), Priority (Low, Medium, High), Frequency (Weekly, Biweekly, Monthly, Quarterly, Biannual, Yearly, Custom) and Familiarity(Familiar, Unfamiliar, Intimate, Meaningful). Once applying those filter, a subset of the contacts book will render on the screen of the Contacts page. The user has the ability to reset the filters to none (full contacts page rerenders).

<b>Interactive Functions Summary: </b> 
- A search bar is implemented on every page which allows the user to query based off of the contact fields: name, company.
- A filter is implemented on every page which allows the user to filter by Active Status, Priority, Frequency and Familiarity
- Add contact operation when signed in
- Reconnect with a contact on the Dashboard which updates the LastContactDate to the day the reconnect button was clicked, and updates the NextContactDate based off the frequency provided for the contact
- Edit contact operation on Contacts page
- Toggle the active status of a specific contact on Contacts page
- Delete a contact on the Contacts page

<b>Upcoming things to work on:</b> Report page (might get repurposed), setting the database with user priveledges on their subset of the data, login page, etc.

Current 3rd party libraries used:  
- Implementing the use of a React toggler for our active/inactive status of the contact: http://aaronshaf.github.io/react-toggle/ 
