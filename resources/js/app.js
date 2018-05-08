  $(document).ready(function() {
    console.log("version: 3.9");

    // Initialize Firebase
var config = {
  apiKey: "AIzaSyCVkzGRau6P1vC-_ZW-oTiOIVdv9v6bReQ",
  authDomain: "gitslack-7be5e.firebaseapp.com",
  databaseURL: "https://gitslack-7be5e.firebaseio.com",
  projectId: "gitslack-7be5e",
  storageBucket: "gitslack-7be5e.appspot.com",
  messagingSenderId: "502584640140"
};
firebase.initializeApp(config);

const database = firebase.database();

        //slack API variables
        var testURL = "https://hooks.slack.com/services/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";
        var clientID = "301088776592.358422362097";
        var clientSecret = "902a482382c63d6f7dcfe549407ce5a6";
        
        //test if add button clicked on last load
        if(localStorage.getItem("user-repo") != "") {
            //store channel name
            const gitUser = localStorage.getItem("user-name");
            const gitRepo = localStorage.getItem("user-repo");
            const gitBranch = localStorage.getItem("user-branch");
            localStorage.setItem("user-name", "");
            localStorage.setItem("user-repo", "");
            localStorage.setItem("user-branch", "");
            
            //store slack code in code variable
            var url_string = window.location.href; //window.location.href
            var url = new URL(url_string);
            var temp_code = url.searchParams.get("code"); //test
    
            //get the webhook (hooya!)
            var getCallURL = "https://slack.com/api/oauth.access?client_id=" + clientID + "&client_secret=" + clientSecret + "&code=" + temp_code; 
            $.ajax({
                type: "GET",
                url: getCallURL
            }).done(function(response) {
                var webhook_url = response.incoming_webhook.url;
                testURL = webhook_url;
                console.log(webhook_url);
                const userRepoBranchCardUI = new UserRepoBranchCard(gitUser, gitRepo, gitBranch, webhook_url);
                // Push Card Info to Firebase
                userRepoBranchCardUI.pushToFirebase(userRepoBranchCardUI);
                ui.showAlert('Repo Added!', 'success');
                });
          }

  // On load, add a new card is hidden.
  // $("#repo-input").hide();

  // $("#newCard").on("click", function(){
  //   $("#card-space").hide();
  //   $("#repo-input").show();
  //   $("input").val("");
  // });

  // $("#clear-results").on("click", function(){
  //   $("input").val("");
  // });

  // the modal =================================================================================
  // Get the modal
  var modal = document.getElementById("myModal");

  // Get the button that opens the modal
  var btn = document.getElementById("myBtn");

  // Get the <span> element that closes the modal
  var span = document.getElementsByClassName("close")[0];

  // When the user clicks the button, open the modal 
  btn.onclick = function() {
      modal.style.display = "block";
  }

  // When the user clicks on <span> (x), close the modal
  span.onclick = function() {
      modal.style.display = "none";
  }

  // When the user clicks anywhere outside of the modal, close it
  window.onclick = function(event) {
      if (event.target == modal) {
          modal.style.display = "none";
      }
  } // end of the modal

  // =======================================================================================

  // Initialize Parent Card Object
let MyParentCardObj = {};
const ui = new UI();
const gitconnect = new GitConnect;

// UI
const gitUserUI = document.getElementById('git-user');
const repoNameUI = document.getElementById('repo-name');
const branchUI = document.getElementById('branch-ui');
const submitBtn = document.getElementById('btn-input');
const clearInputForm = document.getElementById('clear-results');


// test push just uncomment lines below
//   database.ref().push({
//   user: "buddy",
//   repo: "cannon",
//   branch: "master"
// }
// );


// Firebase watcher + initial loader
database.ref().on("child_added", function (childSnapshot) {

  const user = childSnapshot.val().user,
    repo = childSnapshot.val().repo,
    branch = childSnapshot.val().branch;
  firebasechildkey = childSnapshot.key; // comma above?
  console.dir(firebasechildkey);



  // Instantiate UserBranchRepoCard object
  let cardObjName = "card" + firebasechildkey;
  // create initial object
 var userRepoBranchCard = new UserRepoBranchCard(user, repo, branch, cardObjName, webhook_url);
// var ui = new UI();
  // Do the first 2 Git API calls and add to the userRepoBranchCard object
  gitconnect.getUserRepoBranch(user, repo, branch, webhook_url)
    .then(data => {
      if(data.profile.message === 'Not Found'){
        
        ui.showAlert('User not found', 'alert alert-danger');

      } else {
        // Add information to object
        // userRepoBranchCard.firebasekey = firebasechildkey;
        MyParentCardObj[cardObjName] = userRepoBranchCard;
        MyParentCardObj[cardObjName].avatar_url = data.profile.avatar_url;
        MyParentCardObj[cardObjName].firebasekey = firebasechildkey;
        MyParentCardObj[cardObjName].name = data.profile.name;
        MyParentCardObj[cardObjName].bio = data.profile.bio;
        var profileEncodedUrl = encodeURI(data.profile.html_url);
        MyParentCardObj[cardObjName].repolink = profileEncodedUrl;
        MyParentCardObj[cardObjName].sha = data.profileRepoSha.object.sha;
        var shaSpecific1 = MyParentCardObj[cardObjName].sha.value;
        gitconnect.getRepoDetailedInfo(user, repo, branch, MyParentCardObj[cardObjName].sha)
        .then(data => {
          if(data.userRepoDetailWithComments === 'Not Found'){
            ui.showAlert('Details not found', 'alert alert-danger');
          } else {
            
            MyParentCardObj[cardObjName].message = data.userRepoDetailWithComments.commit.message;
            // MyParentCardObj[cardObjName].timeofCommit = toString(data.userRepoDetailWithComments.commit.commiter.date);
        
            // debugger;
            
            // building out the card and adding it to the page
              const cardSection = document.getElementById('card-space');
              const card = document.createElement('div');
              card.innerHTML = `
              <div class="card" id="${cardObjName}"style="width: 18rem;">
              <img class="card-img-top" src="${MyParentCardObj[cardObjName].avatar_url }" alt="Card image cap">
              <div class="card-body">
                <h5 class="card-title">${MyParentCardObj[cardObjName].name}</h5>
                <p class="card-text">${MyParentCardObj[cardObjName].bio}</p>
              </div>
              <ul class="list-group list-group-flush">
                <li class="list-group-item">For ${MyParentCardObj[cardObjName].repo} </li>
                <li class="list-group-item">Most recent commit</li>
                <li class="list-group-item text-success">${MyParentCardObj[cardObjName].message}</li>
                <div class="input-group mt-3 p-1">
                <div class="input-group-prepend">
                  <span class="input-group-text slack-${cardObjName}" id="input-slack-msg">Message</span>
                </div>
                <input type="text" class="form-control" id="slack-msg-text" aria-label="Default" aria-describedby="input slack message">
              </div>
                  <a href="#" class="btn btn-primary m-3 slack">Send Slack Notification</a>
                  <a href="#" class="btn btn-light m-3 delete">Delete Card</a>
                </ul>
                <div class="card-body">
                  <a href="${MyParentCardObj[cardObjName].repolink}" class="card-link">${MyParentCardObj[cardObjName].repolink}</a>
                </div>
              </div>
              `
              cardSection.append(card);
            }
        })
        // MyParentCardObj[cardObjName].sha = data.profileRepoSha.sha;
        // console.dir(cardObjName);
        // console.dir(userRepoBranchCard);
        const objKeys = Object.keys(MyParentCardObj);
        console.log("objkeys: ", objKeys);
      }
    })

  // Handle the errors
}, function (errorObject) {
  console.log("Errors handled: " + errorObject.code);
})


function UserRepoBranchCard(user, repo, branch, webhook_url) {
  this.user = user;
  this.repo = repo;
  this.branch = branch;
  this.webhook_url = webhook_url;
};


UserRepoBranchCard.prototype.pushToFirebase = function(userRepoBranchCardUI) {
  var newSnap = database.ref().push({
    user: userRepoBranchCardUI.user,
    repo: userRepoBranchCardUI.repo,
    branch: userRepoBranchCardUI.branch,
    webhook: userRepoBranchCardUI.webhook_url
  })

  var firebasekeyNewSnap = newSnap.name();
  userRepoBranchCardUI.firebasekey = firebasekeyNewSnap; 

  // Instantiate UserBranchRepoCard object
  let cardObjName = "card" + firebasekeyNewSnap;

  // create initial object
//  var userRepoBranchCard = new UserRepoBranchCard(user, repo, branch, cardObjName);

  // Do the first 2 Git API calls and add to the userRepoBranchCard object
  gitconnect.getUserRepoBranch(user, repo, branch, webhook_url)
    .then(data => {
      if(data.profile.message === 'Not Found'){
        ui.showAlert('User not found', 'alert alert-danger');
      } else {
        // Add information to object
        // userRepoBranchCard.firebasekey = firebasechildkey;
        MyParentCardObj[cardObjName] = userRepoBranchCardUI;
        MyParentCardObj[cardObjName].avatar_url = data.profile.avatar_url;
        MyParentCardObj[cardObjName].firebasekey = firebasechildkey;
        MyParentCardObj[cardObjName].name = data.profile.name;
        MyParentCardObj[cardObjName].bio = data.profile.bio;
        MyParentCardObj[cardObjName].repolink = data.profile.html_url;
        MyParentCardObj[cardObjName].sha = data.profileRepoSha.object.sha;
        var shaSpecific1 = MyParentCardObj[cardObjName].sha.value;
        gitconnect.getRepoDetailedInfo(user, repo, branch, MyParentCardObj[cardObjName].sha)
        .then(data => {
          if(data.userRepoDetailWithComments === 'Not Found'){
            ui.showAlert('Details not found', 'alert alert-danger');
          } else {
            
            MyParentCardObj[cardObjName].message = data.userRepoDetailWithComments.commit.message;
            // MyParentCardObj[cardObjName].timeofCommit = toString(data.userRepoDetailWithComments.commit.commiter.date);
      
            // building out the card and adding it to the page
              const cardSection = document.getElementById('card-space');
              const card = document.createElement('div');
                    card.innerHTML = `
                    <div class="card" id="${cardObjName}"style="width: 18rem;">
                    <img class="card-img-top" src="${MyParentCardObj[cardObjName].avatar_url }" alt="Card image cap">
                    <div class="card-body">
                      <h5 class="card-title">${MyParentCardObj[cardObjName].name}</h5>
                      <p class="card-text">${MyParentCardObj[cardObjName].bio}</p>
                    </div>
                    <ul class="list-group list-group-flush">
                      <li class="list-group-item">For ${MyParentCardObj[cardObjName].repo} </li>
                      <li class="list-group-item">Most recent commit</li>
                      <li class="list-group-item text-success">${MyParentCardObj[cardObjName].message}</li>
                      <div class="input-group mt-3 p-1">
                      <div class="input-group-prepend">
                        <span class="input-group-text slack-${cardObjName}" id="input-slack-msg">Message</span>
                      </div>
                      <input type="text" class="form-control" id="slack-msg-text" aria-label="Default" aria-describedby="input slack message">
                    </div>
                        <a href="#" class="btn btn-primary m-3 slack">Send Slack Notification</a>
                        <a href="#" class="btn btn-light m-3 delete">Delete Card</a>
                      </ul>
                      <div class="card-body">
                        <a href="${MyParentCardObj[cardObjName].repolink}" class="card-link">${MyParentCardObj[cardObjName].repolink}</a>
                      </div>
                    </div>
                    `
              cardSection.append(card);
            }
        })
        // MyParentCardObj[cardObjName].sha = data.profileRepoSha.sha;
        console.dir(cardObjName);
        console.dir(userRepoBranchCard);
        const objKeys = Object.keys(MyParentCardObj);
        console.log("objkeys: ", objKeys);
      }
    })
  // Handle the errors
}, function (errorObject) {
  console.log("Errors handled: " + errorObject.code);
};

// UI Constructor
function UI() {};

// Clearing input
UI.prototype.clearInputFromForm = function() {
  document.getElementById('git-user').value = '';
  document.getElementById('repo-name').value = '';
  document.getElementById('branch-ui').value = '';
}

UI.prototype.deleteCard = function(target){
  let cardObjID2 = target.parentElement.parentElement.id;
  
  if(target.className === 'btn btn-light m-3 delete'){
    // Delete Object from MyParentObj - key is in id of 
   var fbkey = MyParentCardObj[cardObjID2].firebasekey;
   delete MyParentCardObj[cardObjID2];

   // Delete from Firebase
   database.ref().child(fbkey).remove();
  
    // Delete from UI
    target.parentElement.parentElement.remove();

  } else if(target.className === 'card-link'){
    var win = window.open(url, '_blank');
    win.focus();
  } else if(target.className === 'btn btn-primary m-3 slack'){
  
     var slackMsg = target.parentElement.children[3].children[1].value;
     console.log(slackMsg);
     var queryURL = "https://hooks.slack.com/services/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";
     $.ajax({
      data: 'payload=' + JSON.stringify({
      "text": slackMsg
      }),
      processData: false,
      type: "POST",
      url: queryURL
  });

  } 
}

// Show Alert
UI.prototype.showAlert = function(message, className) {
  // Create div
  const div = document.createElement('div');
  // Add Classes
  div.className = `alert ${className}`;
  // Add text
  div.appendChild(document.createTextNode(message));
  // Get parent
  const container = document.querySelector('.container2');
  const form = document.querySelector('#repo-input');
  // Insert alert
  container.insertBefore(div, form);
  // Timeout after 3 seconds
  setTimeout(function(){
    document.querySelector('.alert').remove();
  }, 3000);
}

// Add event listener for Add Repo
document.getElementById('btn-input').addEventListener('click', function(e){
  e.preventDefault();

  const gitUser = gitUserUI.value;
  const gitRepo = repoNameUI.value;
  const gitBranch = branchUI.value;

    // Construct UI
    var ui = new UI();
 
    // Input Validation
    if(gitUser === '' || gitRepo === '' || gitBranch === '') {
      // Error alert
      
    } else {
      // Instantiate Card
    
    // Show Success
    
    // Clear Fields
    ui.clearInputFromForm();
    }
    
        if(gitUser != "") {
            localStorage.setItem("user-name", gitUser);
            localStorage.setItem("user-repo", gitRepo);
            localStorage.setItem("user-branch", gitBranch);
            $("#btn-input").remove();
            $("#input-button-div").html("<a href='https://slack.com/oauth/authorize?client_id=301088776592.358422362097&scope=incoming-webhook'><img alt='Add to Slack' height='40' width='139' src='https://platform.slack-edge.com/img/add_to_slack.png' srcset='https://platform.slack-edge.com/img/add_to_slack.png 1x, https://platform.slack-edge.com/img/add_to_slack@2x.png 2x' /></a>");
        }
    e.preventDefault();
  });
 


// Event Delegation - Event Listener for Card Delete
document.getElementById('card-space').addEventListener('click', function(e) {
  // instantiate ui object
  const ui = new UI();
  ui.deleteCard(e.target);
  // Show alert
  // ui.showalert('Card Removed', 'success');

  e.preventDefault();

})

// Add Event Listener for Clear Form
document.getElementById('clear-results').addEventListener('click', function(e){
  e.preventDefault();
  ui.clearInputFromForm();

});
}); // end of document.ready