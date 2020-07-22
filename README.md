#GroupProject_jsonStatham_API

this repo is for the API, I ended up having to rearrange the .git repository, so it might be better to just delete the local repo and git clone again. If you lose access to your local branch from freshly git cloning, command `git branch -a` to see what we have available on the remote, and then `git checkout [branchname]` to create a local tracking branch.   
Our .git resided in the root folder, I created .git for api and ui respectively and pushed the changes. So I'd delete the root folder altogether, create an empty root folder, and git clone from each repo. Then retrieve your branch in the api, and create a new branch in the UI (`git checkout -b [branchname]`)  
  
Also, using Atlas, think I've given full access to everyone, In Cluster0, click CONNECT, whitelist your IP address, and create the user. Then connect your application, save the URI to your .env file. We can comment it out at the moment bc this will break everything in the IssueTracker API. 
