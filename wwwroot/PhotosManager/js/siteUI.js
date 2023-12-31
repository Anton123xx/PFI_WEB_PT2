//<span class="cmdIcon fa-solid fa-ellipsis-vertical"></span>


let basePhotoRoot = 'https://glittery-flossy-august.glitch.me/assetsRepository/';
let contentScrollPosition = 0;
let sortType = "date";
let keywords = "";
let loginMessage = "";
let Email = "";
let EmailError = "";
let passwordError = "";
let currentETag = "";
let currentViewName = "photosList";
let delayTimeOut = 900; // seconds
let queryString = "";/////////////

// pour la pagination
let photoContainerWidth = 400;
let photoContainerHeight = 400;
let limit;
let HorizontalPhotosCount;
let VerticalPhotosCount;
let offset = 0;

Init_UI();
function Init_UI() {
    getViewPortPhotosRanges();
    initTimeout(delayTimeOut, renderExpiredSession);
    installWindowResizeHandler();
    if (API.retrieveLoggedUser())
        renderPhotos();
    else
        renderLoginForm();
}

// pour la pagination
function getViewPortPhotosRanges() {
    // estimate the value of limit according to height of content
    VerticalPhotosCount = Math.round($("#content").innerHeight() / photoContainerHeight);
    HorizontalPhotosCount = Math.round($("#content").innerWidth() / photoContainerWidth);
    limit = (VerticalPhotosCount + 1) * HorizontalPhotosCount;
    console.log("VerticalPhotosCount:", VerticalPhotosCount, "HorizontalPhotosCount:", HorizontalPhotosCount)
    offset = 0;
}
// pour la pagination
function installWindowResizeHandler() {
    var resizeTimer = null;
    var resizeEndTriggerDelai = 250;
    $(window).on('resize', function (e) {
        if (!resizeTimer) {
            $(window).trigger('resizestart');
        }
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function () {
            resizeTimer = null;
            $(window).trigger('resizeend');
        }, resizeEndTriggerDelai);
    }).on('resizestart', function () {
        console.log('resize start');
    }).on('resizeend', function () {
        console.log('resize end');
        if ($('#photosLayout') != null) {
            getViewPortPhotosRanges();
            if (currentViewName == "photosList")
                renderPhotosList();
        }
    });
}
function attachCmd() {
    $('#loginCmd').on('click', renderLoginForm);
    $('#logoutCmd').on('click', logout);
    $('#newPhotoCmd').on("click", renderNewPicForm);////
    $('#listPhotosCmd').on('click', renderPhotos);///
    $('#listPhotosMenuCmd').on('click', renderPhotos);
    $('#editProfilMenuCmd').on('click', renderEditProfilForm);
    $('#renderManageUsersMenuCmd').on('click', renderManageUsers);
    $('#editProfilCmd').on('click', renderEditProfilForm);
    $('#aboutCmd').on("click", renderAbout);



    $('#sortByDateCmd').on('click', function () {
        queryString = "?sort=Date";
        sortType = "date";
        refreshHeader();
        renderPhotosList();
    });
    $('#sortByOwnersCmd').on('click', function () {
        queryString = "?sort=OwnerId";
        sortType = "users";
        refreshHeader();
        renderPhotosList();
    });
    $('#sortByLikesCmd').on('click', function () {
        queryString = "?sort=Likes,desc";
        sortType = "like";
        refreshHeader();
        renderPhotosList();
    });
    $('#ownerOnlyCmd').on('click', function () {
        queryString = "?OwnerId=" + (API.retrieveLoggedUser()).Id;
        sortType = "owner";
        refreshHeader();
        renderPhotosList();
    });



}
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/// Header management
function loggedUserMenu() {
    let loggedUser = API.retrieveLoggedUser();
    if (loggedUser) {
        let manageUserMenu = `
            <span class="dropdown-item" id="renderManageUsersMenuCmd">
                <i class="menuIcon fas fa-user-cog mx-2"></i> Gestion des usagers
            </span>
            <div class="dropdown-divider"></div>
        `;

        let checkMark = `<i class="menuIcon fa fa-check mx-2"></i>`;
        return `
            ${loggedUser.isAdmin ? manageUserMenu : ""}
            <span class="dropdown-item" id="logoutCmd">
                <i class="menuIcon fa fa-sign-out mx-2"></i> Déconnexion
            </span>
            <span class="dropdown-item" id="editProfilMenuCmd">
                <i class="menuIcon fa fa-user-edit mx-2"></i> Modifier votre profil
            </span>
            <div class="dropdown-divider"></div>
            <span class="dropdown-item" id="listPhotosMenuCmd">
                <i class="menuIcon fa fa-image mx-2"></i> Liste des photos
            </span>

            

            <span class="dropdown-item" id="sortByDateCmd">
            ${sortType === "date" ? checkMark : `<i class="menuIcon fa fa-fw mx-2"></i>`}
            <i class="menuIcon fa fa-calendar mx-2"></i>
            Photos par date de création
            </span>
            <span class="dropdown-item" id="sortByOwnersCmd">
            ${sortType === "users" ? checkMark : `<i class="menuIcon fa fa-fw mx-2"></i>`}
            <i class="menuIcon fa fa-users mx-2"></i>
            Photos par créateur
            </span>
            <span class="dropdown-item" id="sortByLikesCmd">
            ${sortType === "like" ? checkMark : `<i class="menuIcon fa fa-fw mx-2"></i>`}
            <i class="menuIcon fa fa-user mx-2"></i>
            Photos les plus aiméés
            </span>
            <span class="dropdown-item" id="ownerOnlyCmd">
            ${sortType === "owner" ? checkMark : `<i class="menuIcon fa fa-fw mx-2"></i>`}
            <i class="menuIcon fa fa-user mx-2"></i>
            Mes photos
            </span>
        `;
    }
    else
        return `
            <span class="dropdown-item" id="loginCmd">
                <i class="menuIcon fa fa-sign-in mx-2"></i> Connexion
            </span>`;
}
function viewMenu(viewName) {
    if (viewName == "photosList") {
        return
    }
    else
        return "";
}
function connectedUserAvatar() {
    let loggedUser = API.retrieveLoggedUser();
    if (loggedUser)
        return `
            <div class="UserAvatarSmall" userId="${loggedUser.Id}" id="editProfilCmd" style="background-image:url('${loggedUser.Avatar}')" title="${loggedUser.Name}"></div>
        `;
    return "";
}
function refreshHeader() {
    UpdateHeader(currentViewTitle, currentViewName);
}
function UpdateHeader(viewTitle, viewName) {
    currentViewTitle = viewTitle;
    currentViewName = viewName;
    $("#header").empty();
    $("#header").append(`
        <span title="Liste des photos" id="listPhotosCmd"><img src="images/PhotoCloudLogo.png" class="appLogo"></span>
        <span class="viewTitle">${viewTitle} 
            <div class="cmdIcon fa fa-plus" id="newPhotoCmd" title="Ajouter une photo"></div>
        </span>

        <div class="headerMenusContainer">
            <span>&nbsp</span> <!--filler-->
            <i title="Modifier votre profil"> ${connectedUserAvatar()} </i>         
            <div class="dropdown ms-auto dropdownLayout">
                <div data-bs-toggle="dropdown" aria-expanded="false">
                    <i class="cmdIcon fa fa-ellipsis-vertical"></i>
                </div>
                <div class="dropdown-menu noselect">
                    ${loggedUserMenu()}
                    ${viewMenu(viewName)}
                    <div class="dropdown-divider"></div>
                    <span class="dropdown-item" id="aboutCmd">
                        <i class="menuIcon fa fa-info-circle mx-2"></i> À propos...
                    </span>
                </div>
            </div>

        </div>
    `);
    if (sortType == "keywords" && viewName == "photosList") {
        $("#customHeader").show();
        $("#customHeader").empty();
        $("#customHeader").append(`
            <div class="searchContainer">
                <input type="search" class="form-control" placeholder="Recherche par mots-clés" id="keywords" value="${keywords}"/>
                <i class="cmdIcon fa fa-search" id="setSearchKeywordsCmd"></i>
            </div>
        `);
    } 

    else if(sortType == "users"){

    }
    else {
        $("#customHeader").hide();
    }
    attachCmd();


}
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/// Actions and command
async function login(credential) {
    console.log("login");
    loginMessage = "";
    EmailError = "";
    passwordError = "";
    Email = credential.Email;
    await API.login(credential.Email, credential.Password);
    if (API.error) {
        switch (API.currentStatus) {
            case 482: passwordError = "Mot de passe incorrect"; renderLoginForm(); break;
            case 481: EmailError = "Courriel introuvable"; renderLoginForm(); break;
            default: renderError("Le serveur ne répond pas"); break;
        }
    } else {
        let loggedUser = API.retrieveLoggedUser();
        if (loggedUser.VerifyCode == 'verified') {
            if (!loggedUser.isBlocked)
                renderPhotos();
            else {
                loginMessage = "Votre compte a été bloqué par l'administrateur";
                logout();
            }
        }
        else
            renderVerify();
    }
}
async function logout() {
    console.log('logout');
    await API.logout();
    renderLoginForm();
}
function isVerified() {
    let loggedUser = API.retrieveLoggedUser();
    return loggedUser.VerifyCode == "verified";
}
async function verify(verifyCode) {
    let loggedUser = API.retrieveLoggedUser();
    if (await API.verifyEmail(loggedUser.Id, verifyCode)) {
        renderPhotos();
    } else {
        renderError("Désolé, votre code de vérification n'est pas valide...");
    }
}
async function editProfil(profil) {
    if (await API.modifyUserProfil(profil)) {
        let loggedUser = API.retrieveLoggedUser();
        if (loggedUser) {
            if (isVerified()) {
                renderPhotos();
            } else
                renderVerify();
        } else
            renderLoginForm();

    } else {
        renderError("Un problème est survenu.");
    }
}
async function createProfil(profil) {
    if (await API.register(profil)) {
        loginMessage = "Votre compte a été créé. Veuillez prendre vos courriels pour réccupérer votre code de vérification qui vous sera demandé lors de votre prochaine connexion."
        renderLoginForm();
    } else {
        renderError("Un problème est survenu.");
    }
}
async function adminDeleteAccount(userId) {
    if (await API.unsubscribeAccount(userId)) {
        renderManageUsers();
    } else {
        renderError("Un problème est survenu.");
    }
}
async function AddLike(data,wheretoRefresh) {
    if (await API.LikePhoto(data)) {
            renderPhotosList();
    } else {
        renderError("Un problème est survenu.");
    }
}
async function RemoveLike(photoId) {
    if (await API.UnlikePhoto(photoId)) {
        renderPhotosList();
    } else {
        renderError("Un problème est survenu.");
    }
}

async function RemovePhoto(photoId) {
    if (await API.DeletePhoto(photoId)) {
        renderPhotosList();
    } else {
        renderError("Un problème est survenu.");
    }
}

async function deleteProfil() {
    let loggedUser = API.retrieveLoggedUser();
    if (loggedUser) {
        if (await API.unsubscribeAccount(loggedUser.Id)) {
            loginMessage = "Votre compte a été effacé.";
            logout();
        } else
            renderError("Un problème est survenu.");
    }
}
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/// Views rendering
function showWaitingGif() {
    eraseContent();
    $("#content").append($("<div class='waitingGifcontainer'><img class='waitingGif' src='images/Loading_icon.gif' /></div>'"));
}
function eraseContent() {
    $("#content").empty();
}
function saveContentScrollPosition() {
    contentScrollPosition = $("#content")[0].scrollTop;
}
function restoreContentScrollPosition() {
    $("#content")[0].scrollTop = contentScrollPosition;
}
async function renderError(message) {
    noTimeout();
    switch (API.currentStatus) {
        case 401:
        case 403:
        case 405:
            message = "Accès refusé...Expiration de votre session. Veuillez vous reconnecter.";
            await API.logout();
            renderLoginForm();
            break;
        case 404: message = "Ressource introuvable..."; break;
        case 409: message = "Ressource conflictuelle..."; break;
        default: if (!message) message = "Un problème est survenu...";
    }
    saveContentScrollPosition();
    eraseContent();
    UpdateHeader("Problème", "error");
    $("#newPhotoCmd").hide();
    $("#content").append(
        $(`
            <div class="errorContainer">
                <b>${message}</b>
            </div>
            <hr>
            <div class="form">
                <button id="connectCmd" class="form-control btn-primary">Connexion</button>
            </div>
        `)
    );
    $('#connectCmd').on('click', renderLoginForm);
    /* pour debug
     $("#content").append(
        $(`
            <div class="errorContainer">
                <b>${message}</b>
            </div>
            <hr>
            <div class="systemErrorContainer">
                <b>Message du serveur</b> : <br>
                ${API.currentHttpError} <br>

                <b>Status Http</b> :
                ${API.currentStatus}
            </div>
        `)
    ); */
}
function renderAbout() {
    timeout();
    saveContentScrollPosition();
    eraseContent();
    UpdateHeader("À propos...", "about");
    $("#newPhotoCmd").hide();
    $("#createContact").hide();
    $("#abort").show();
    $("#content").append(
        $(`
            <div class="aboutContainer">
                <h2>Gestionnaire de photos</h2>
                <hr>
                <p>
                    Petite application de gestion de photos multiusagers à titre de démonstration
                    d'interface utilisateur monopage réactive.
                </p>
                <p>
                    Auteur: vos noms d'équipiers
                </p>
                <p>
                    Collège Lionel-Groulx, automne 2023
                </p>
            </div>
        `))
}
async function renderPhotos() {
    timeout();
    showWaitingGif();
    UpdateHeader('Liste des photos', 'photosList')
    $("#newPhotoCmd").show();
    $("#abort").hide();
    let loggedUser = API.retrieveLoggedUser();
    if (loggedUser)
        renderPhotosList();
    else {
        renderLoginForm();
    }
}


function renderNewPicForm()/////////////
{
    noTimeout();
    eraseContent();
    UpdateHeader("Ajout de photos", "addPic");
    //$("#newPhotoCmd").hide();
    $("#content").append(`
        <br/>
        <form class="form" id="uploadNewPicForm"'>
            
               
            <fieldset>
                <legend>Informations</legend>
                <input  type="text" 
                        class="form-control Alpha" 
                        name="Title" 
                        id="Title"
                        placeholder="Titre" 
                        required 
                        RequireMessage = 'Veuillez entrer un titre'
                        InvalidMessage = 'Titre invalide'/>

                
                        <textarea
                        class="form-control Alpha"
                        name="Description"
                        id="Description"
                        placeholder="Description"
                    ></textarea>

                <input  type="checkbox"   
                        name="Share" 
                        id="Share" 
                        />

                <label for="Share">Partagée</label>

            </fieldset>
            <fieldset>
                <legend>Image</legend>
                <div class='imageUploader' 
                        newImage='true' 
                        controlId='Image' 
                        imageSrc='images/PhotoCloudLogo.png' 
                        waitingImage="images/Loading_icon.gif">
            </div>
            </fieldset>
   
            <input type='submit' name='submit' id='saveUser' value="Enregistrer" class="form-control btn-primary">
        </form>
        <div class="cancel">
            <button class="form-control btn-secondary" id="abortCreateProfilCmd">Annuler</button>
        </div>
    `);
    //$('#loginCmd').on('click', renderLoginForm);
    initFormValidation(); // important do to after all html injection!
    initImageUploaders();
    $('#abortCreateProfilCmd').on('click', renderPhotos);
    //addConflictValidation(API.checkConflictURL(), 'Email', 'saveUser');
    $('#uploadNewPicForm').on("submit", function (event) {
        let photo = getFormData($('#uploadNewPicForm'));

        if (photo.Image === "") {
            photo.Image = 'PhotoCloudLogo.png';
        }
        //Mettre la valeur de OwnerId
        let loggedUser = API.retrieveLoggedUser();
        Object.assign(photo, { OwnerId: loggedUser.Id })

        //Mettre la valeur de Date
        let date = Date.now();
        Object.assign(photo, { Date: date })


        //Mettre la valeur de Share
        Object.assign(photo, { Shared: document.getElementById("Share").checked })
        console.log(photo);
        //document.getElementById("Share").checked 


        event.preventDefault();
        showWaitingGif();
        API.CreatePhoto(photo);
    });
}

async function renderPhotosList()////////////////
{
    //$("#content").append("en construction");
    eraseContent();

    UpdateHeader('Liste des photos', 'pictures list');
    let photos = await API.GetPhotos(queryString);
    let loggedUser = API.retrieveLoggedUser();
    const photoLikes = await API.GetPhotoLikes();

    console.log(photos);
    /*
    //Si la sorte de tri est a users
    if(sortType === "users"){
        photos.data.sort(function (a, b) {
            if (a.OwnerId < b.OwnerId) {
              return -1;
            }
            if (a.OwnerId > b.OwnerId) {
              return 1;
            }
            return 0;
          });
    }

    //Si la sorte de tri est a Likes
    if(sortType === "like"){
        photos.data = photos.data.sort(async function (a, b) {
            const photoLikesA = await API.GetPhotoLikesCounter(a.Id);
            const photoLikesB = await API.GetPhotoLikesCounter(b.Id);
            if (photoLikesA.data.length < photoLikesB.data.length) {
            return -1;
            }
            if (photoLikesA.data.length > photoLikesB.data.length) {
            return 1;
            }
            return 0;
        });
    }

    //Si la sort de tri est a owner
    if(sortType === "owner"){

        for (var i = 0; i < photos.data.length; i++) {
            var obj = photos.data[i];
        
            if (photos.data[i].OwnerId !== loggedUser.Id) {
                photos.data.splice(i, 1);
                i--;
            }
        }
        console.log(photos.data);
    }

*/


    if (API.error) {
        renderError();
    } else {
        let photoRow = `<div class="photosLayout""> `;
        let photolikeRef = [];
        for (const photo of photos.data) {
            console.log(photos.data);
            const photoLikes = await API.GetPhotoLikesCounter(photo.Id);
            let hasILiked = false;


            //Verif si la photo est priver ou non
            if (photo.Shared || photo.OwnerId === loggedUser.Id) {
                let user = await API.GetAccount(photo.OwnerId);

                //Verif si la personne est bloquer
                if (user.data.Authorizations.readAccess !== -1 && user.data.Authorizations.writeAccess !== -1) {
                    for (var i = 0; i < photoLikes.data.length; i++) {
                        if (photoLikes.data[i].LikedById === `${loggedUser.Id}`) {
                            hasILiked = true;
                            photolikeRef = photoLikes.data[i];
                            break;
                        }
                    }


                    photoRow = photoRow + `
                                <div class="photoLayout">
                                <div class="photoOwnerModifBtn">
                                <span class="photoTitle">${photo.Title}</span>`;

                    //Si notre photo = on peut la modifier et la supprimer
                    if (loggedUser.Id === photo.OwnerId) {
                        photoRow = photoRow + `<span id="ModifPhoto" class="ModifPhoto" name="${photo.Id}"><i class="fa-solid fa-pen"></i></span>
                            <span id="deletePhoto" class="deletePhoto" name="${photo.Id}"><i class="fa-solid fa-trash"></i></span>`;
                    }

                    //Mettre la photo
                    photoRow = photoRow + `</div><div class="photoImage" id="photoImage" name="${photo.Id}" style="background-image:url('${photo.Image}')">`;

                    photoRow = photoRow + `<div class="UserPhotoAvatarSmall" style="background-image:url('${user.data.Avatar}')"></div>`;

                    if (user.data.Id === loggedUser.Id) {
                        if (photo.Shared) {
                            photoRow = photoRow + `<div class="UserPhotoAvatarSmall" style="background-image:url('https://glittery-flossy-august.glitch.me/shared.png');
                                background-color: #ffffff70;"></div>`;
                        }
                    }
                    photoRow = photoRow + `</div>`;

                    //Date creation + compteur de like
                    photoRow = photoRow + `
                        <div class="photoCreationDate">
                            <span>${taskDate(photo.Date)}</span>
                            <div class="likesSummary">
                                <span>${photoLikes.data.length}</span>`;

                    //Object.values(photoLikes.data)
                    //photoLikes.data.includes({LikedById:loggedUser.Id})
                    //condition si la photo est liker par nous *** A MODIFIER ***
                    if (!hasILiked)
                        photoRow = photoRow + `<span id="LikePhoto" class="likesBtn" name="${photo.Id}"><i class="fa-regular fa-thumbs-up"></i></span>`;
                    else
                        photoRow = photoRow + `<span id="UnlikePhoto" likeId="" class="unlikesBtn" name="${photo.Id}"><i class="fa fa-thumbs-up"></i></span>`;
                    photoRow = photoRow + `</div></div></div>`;
                }
            }
        }
        photoRow = photoRow + `</div>`;
        $("#content").append(photoRow);
    }

    $('.ModifPhoto').on('click', function () {
        renderEditPhotoForm($(this).attr("name"));
    });

    $('.deletePhoto').on('click', function () {
        renderConfirmDeletePhoto($(this).attr("name"));
    });

    $('.photoImage').on('click', function () {
        renderPhotosDetails($(this).attr("name"));
    });

    $('.likesBtn').on('click', async function (event) {
        let photo = await API.GetPhotosById($(this).attr("name"));
        const data = { ImageId: `${$(this).attr("name")}`, LikedById: `${loggedUser.Id}` };

        API.LikePhoto(data);

        let result = simulateUpdate(photo);
        if (result != null) {
            currentETagPhotos = result.ETag;
            renderPhotosList();
        }
        else {
            renderError();
        }
    });
    $('.unlikesBtn').on('click', async function () {
        const photoLikes = await API.GetPhotoLikesCounter($(this).attr("name"));
        let photo = await API.GetPhotosById($(this).attr("name"));
        let photolikeRef;
        for (var i = 0; i < photoLikes.data.length; i++) {
            if (photoLikes.data[i].LikedById === `${loggedUser.Id}`) {
                photolikeRef = photoLikes.data[i];
                break;
            }
        }
        API.UnlikePhoto(photolikeRef.Id);

        let result = simulateUpdate(photo);
        if (result != null) {
            currentETagPhotos = result.ETag;
            renderPhotosList();
        }
        else {
            renderError();
        }
        ///API.UnlikePhoto(photolikeRef.Id);
    });

}


function taskDate(dateMilli) {
    let yourDate = new Date(dateMilli).toLocaleDateString("fr-FR", { year: 'numeric', month: '2-digit', day: '2-digit', weekday: "long", hour: '2-digit', hour12: false, minute: '2-digit', second: '2-digit' });

    let day = yourDate.substring(yourDate.indexOf('/') - 2, yourDate.indexOf('/'));
    let month = yourDate.substring(yourDate.indexOf('/') + 1, yourDate.indexOf('/') + 3);
    let year = yourDate.substring(yourDate.indexOf('/') + 4, yourDate.indexOf('/') + 8);
    let time = yourDate.substring(yourDate.indexOf('/') + 8);

    let finalString = yourDate.substring(0, yourDate.indexOf(' ')) + " le " + day + " " + getMonth(month) + " " + year + " @ " + time;
    return finalString;
}

function getMonth(month) {
    switch (month) {
        case "0":
            return "null";
        case "1":
            return "janvier";
        case "2":
            return "février";
        case "3":
            return "mars";
        case "4":
            return "avril";
        case "5":
            return "mai";
        case "6":
            return "juin";
        case "7":
            return "juillet";
        case '8':
            return "août";
        case '9':
            return "septembre";
        case '10':
            return "octobre";
        case '11':
            return "novembre ";
        case '12':
            return "décembre";
    }
}
async function renderEditPhotoForm(photoID) {
    let photo = await API.GetPhotosById(photoID);

    timeout();
    let loggedUser = API.retrieveLoggedUser();
    if (loggedUser) {
        eraseContent();
        UpdateHeader("Modification de photo", "edit Photo");
        $("#newPhotoCmd").hide();

        let body = `
        <br/>
        <form class="form" id="updatePicForm"'>
        <input type="hidden" id="OwnerId" value="${photo.OwnerId}">
        <input type="hidden" id="Date" value="${photo.Date}">
               
            <fieldset>
                <legend>Informations</legend>
                <input  value="${photo.Title}"
                        type="text" 
                        class="form-control Alpha" 
                        name="Title" 
                        id="Title"
                        placeholder="Titre" 
                        required 
                        RequireMessage = 'Veuillez entrer un titre'
                        InvalidMessage = 'Titre invalide'/>

                
                        <textarea
                        class="form-control Alpha"
                        name="Description"
                        id="Description"
                        placeholder="Description"
                        
                    >${photo.Description}</textarea>
                    `;
        let value;
        if (photo.Shared) {
            value = "checked";
        } else {
            value = "unchecked";
        }
        body = body + `

                <input  type="checkbox"   
                        ${value}
                        name="Share" 
                        id="Share" 
                        />

                <label for="Share">Partagée</label>

            </fieldset>
            <fieldset>
                <legend>Image</legend>
                <div class='imageUploader' 
                        newImage='true' 
                        controlId='Image' 
                        imageSrc='${photo.Image}' 
                        waitingImage="images/Loading_icon.gif">
            </div>
            </fieldset>
         
            <input type='submit' name='submit' id='saveUser' value="Enregistrer" class="form-control btn-primary">
        </form>
        <div class="cancel">
            <button class="form-control btn-secondary" id="abortCreateProfilCmd">Annuler</button>
        </div>
    `;
        $("#content").append(body);
        initFormValidation(); // important do to after all html injection!
        initImageUploaders();
        $('#abortCreateProfilCmd').on('click', renderPhotos);
        $('#updatePicForm').on("submit", async function (event) {



            let photoModified = getFormData($('#updatePicForm'));
            console.log(photoModified);
            event.preventDefault();
            showWaitingGif();
            if (photoModified.Shared == "on") {
                photoModified.Shared = true;
            }
            else {
                photoModified.Shared = false;
            }
            Object.assign(photoModified, { OwnerId: photo.OwnerId });
            Object.assign(photoModified, { Date: photo.Date });
            Object.assign(photoModified, { Id: photo.Id });

            if(photoModified.Image === ''){

                photoModified.Image = photo.Image.substring(basePhotoRoot.length);
            }

            let result = API.UpdatePhoto(photoModified);
            if (result === null) {
                currentETagPhotos = result.ETag;
                renderPhotosList();
            }
            else {
                
            }







            //let photoModified = getFormData($('#updatePicForm'));
            //if(photoModified.Image === ""){
            //photoModified.Image = 'PhotoCloudLogo.png';
            //}
            //Mettre la valeur de OwnerId
            //let loggedUser = API.retrieveLoggedUser();
            //Object.assign(photoModified,{OwnerId: loggedUser.Id })

            //Mettre la valeur de Date
            // let date = Date.now();
            //Object.assign(photoModified,{Date: date })


            //Mettre la valeur de Share
            // Object.assign(photoModified,{Shared: document.getElementById("Share").checked })
            //console.log(photoModified);
            //document.getElementById("Share").checked 


            //event.preventDefault();
            //showWaitingGif();
            // API.UpdatePhoto(photoModified);
        });
    }
}

async function renderConfirmDeletePhoto(photoID) {
    timeout();
    let photo = await API.GetPhotosById(photoID);
    if (photo) {
        let photoToDelete = await API.GetPhotosById(photoID);
        if (!API.error) {
            eraseContent();
            UpdateHeader("Retrait de photo", "confirmDelete Picture");
            $("#newPhotoCmd").hide();
            $("#content").append(`
                <div class="content loginForm">
                    <br>
                    <div class="form UserRow ">
                        <h4> Voulez-vous vraiment effacer cette photo? </h4>
                        <div class="UserContainer noselect">
                            <div class="photoLayout">
                            <div class="photoTitleContainer">
                                    <span class="photoTitle">${photoToDelete.Title}</span>
                            </div>
                                <div class="photoImage" style="background-image:url('${photoToDelete.Image}')"></div>
                                
                            </div>
                        </div>
                    </div>           
                    <div class="form">
                        <button class="form-control btn-danger" id="deletePhotoCmd">Effacer</button>
                        <br>
                        <button class="form-control btn-secondary" id="abortDeletePhotoCmd">Annuler</button>
                    </div>
                </div>
            `);
            $("#deletePhotoCmd").on("click", function () {
                RemovePhoto(photoToDelete.Id);
            });
            $("#abortDeletePhotoCmd").on("click", renderPhotosList);
        } else {
            renderError("Une erreur est survenue");
        }
    }
}

async function renderPhotosDetails(photoID)////////////////
{
    //$("#content").append("en construction");
    timeout();
    eraseContent();
    let loggedUser = API.retrieveLoggedUser();
    let photo = await API.GetPhotosById(photoID);
    UpdateHeader('Détails', 'pictures details');
    const photoLikes = await API.GetPhotoLikesCounter(photoID);
    let hasILiked = false;

    for (var i = 0; i < photoLikes.data.length; i++) {
        if (photoLikes.data[i].LikedById === `${loggedUser.Id}`) {
            hasILiked = true;
            break;
        }
    }
    let photoRow = `<div class="photoLayout"> `;

    let user = await API.GetAccount(photo.OwnerId);
    photoRow = photoRow + `<div class="photoDetailsOwner">
                                    <div class="UserPhotoAvatarSmall" style="background-image:url('${user.data.Avatar}')"></div>
                                    <div>${user.data.Name}</div>
                                </div><hr>`;

    photoRow = photoRow + `
                    <div class="photoTitleContainer">
                    <span class="photoDetailsTitle">${photo.Title}</span></div>
                    `;

    //Mettre la photo
    photoRow = photoRow + `<div class="photoDetailsLargeImage" id="photoImage" name="${photo.Id}" ">
                                <img src=${photo.Image}>
                            </div>`;

    //Date creation + compteur de like
    photoRow = photoRow + ` <div class="photoDetailsCreationDate"><span>${taskDate(photo.Date)}</span> <div class="likesSummary">
        <span>${photoLikes.data.length}</span>`;

    if (!hasILiked)
        photoRow = photoRow + `<span id="LikePhoto" class="likesBtn" name="${photo.Id}"><i class="fa-regular fa-thumbs-up"></i></span><span class="details">${await NameHowLiked(photo)}</span>`;
    else
        photoRow = photoRow + `<span id="UnlikePhoto" class="unlikesBtn" name="${photo.Id}"><i class="fa fa-thumbs-up"></i></span><span class="details">${await NameHowLiked(photo)}</span>`;
    photoRow = photoRow + `</div></div></div>`;



    //Description
    photoRow = photoRow + ` <div class="photoDetailsDescription">${photo.Description}</div>`;


    $("#content").append(photoRow);

    $('.ModifPhoto').on('click', function () {
        renderEditPhotoForm($(this).attr("name"));
    });

    $('.deletePhoto').on('click', function () {
        renderConfirmDeletePhoto($(this).attr("name"));
    });
    $('.likesBtn').on('click', async function (event) {
        const data = { ImageId: `${$(this).attr("name")}`, LikedById: `${loggedUser.Id}` };

        API.LikePhoto(data);

        let result = simulateUpdate(photo);
        if (result != null) {
            renderPhotosDetails(photoID);
        }
        else {
            renderError();
        }
        //API.CreatePhotoLikeCounter(data);
    });
    $('.unlikesBtn').on('click', async function (event) {
        const photoLikes = await API.GetPhotoLikesCounter($(this).attr("name"));
        let photolikeRef;
        for (var i = 0; i < photoLikes.data.length; i++) {
            if (photoLikes.data[i].LikedById === `${loggedUser.Id}`) {
                photolikeRef = photoLikes.data[i];
                break;
            }
        }

        API.UnlikePhoto(photolikeRef.Id);

        let result = simulateUpdate(photo);
        if (result != null) {
            renderPhotosDetails(photoID);
        }
        else {
            renderError();
        }
    });
}

function simulateUpdate(photo){
    photo.Image = photo.Image.substring(basePhotoRoot.length);
    let result = API.UpdatePhoto(photo);
    return result;
}

async function NameHowLiked(photo){
    
    const photoLikes = await API.GetPhotoLikesCounter(photo.Id);

    let text = "";
    text = text + `<span class="hidden-info">`;
    for (var i = 0; i < photoLikes.data.length && i <10; i++) {
        //Afficher la liste des gens qui ont like

        let user = await API.GetAccount(photoLikes.data[i].LikedById);
        text = text + `${user.data.Name}<br>`;
    }
    text = text + `</span>`;
    return text;
}

function renderVerify() {
    eraseContent();
    UpdateHeader("Vérification", "verify");
    $("#newPhotoCmd").hide();
    $("#content").append(`
        <div class="content">
            <form class="form" id="verifyForm">
                <b>Veuillez entrer le code de vérification de que vous avez reçu par courriel</b>
                <input  type='text' 
                        name='Code'
                        class="form-control"
                        required
                        RequireMessage = 'Veuillez entrer le code que vous avez reçu par courriel'
                        InvalidMessage = 'Courriel invalide';
                        placeholder="Code de vérification de courriel" > 
                <input type='submit' name='submit' value="Vérifier" class="form-control btn-primary">
            </form>
        </div>
    `);
    initFormValidation(); // important do to after all html injection!
    $('#verifyForm').on("submit", function (event) {
        let verifyForm = getFormData($('#verifyForm'));
        event.preventDefault();
        showWaitingGif();
        verify(verifyForm.Code);
    });
}
function renderCreateProfil() {
    noTimeout();
    eraseContent();
    UpdateHeader("Inscription", "createProfil");
    $("#newPhotoCmd").hide();
    $("#content").append(`
        <br/>
        <form class="form" id="createProfilForm"'>
            <fieldset>
                <legend>Adresse ce courriel</legend>
                <input  type="email" 
                        class="form-control Email" 
                        name="Email" 
                        id="Email"
                        placeholder="Courriel" 
                        required 
                        RequireMessage = 'Veuillez entrer votre courriel'
                        InvalidMessage = 'Courriel invalide'
                        CustomErrorMessage ="Ce courriel est déjà utilisé"/>

                <input  class="form-control MatchedInput" 
                        type="text" 
                        matchedInputId="Email"
                        name="matchedEmail" 
                        id="matchedEmail" 
                        placeholder="Vérification" 
                        required
                        RequireMessage = 'Veuillez entrez de nouveau votre courriel'
                        InvalidMessage="Les courriels ne correspondent pas" />
            </fieldset>
            <fieldset>
                <legend>Mot de passe</legend>
                <input  type="password" 
                        class="form-control" 
                        name="Password" 
                        id="Password"
                        placeholder="Mot de passe" 
                        required 
                        RequireMessage = 'Veuillez entrer un mot de passe'
                        InvalidMessage = 'Mot de passe trop court'/>

                <input  class="form-control MatchedInput" 
                        type="password" 
                        matchedInputId="Password"
                        name="matchedPassword" 
                        id="matchedPassword" 
                        placeholder="Vérification" required
                        InvalidMessage="Ne correspond pas au mot de passe" />
            </fieldset>
            <fieldset>
                <legend>Nom</legend>
                <input  type="text" 
                        class="form-control Alpha" 
                        name="Name" 
                        id="Name"
                        placeholder="Nom" 
                        required 
                        RequireMessage = 'Veuillez entrer votre nom'
                        InvalidMessage = 'Nom invalide'/>
            </fieldset>
            <fieldset>
                <legend>Avatar</legend>
                <div class='imageUploader' 
                        newImage='true' 
                        controlId='Avatar' 
                        imageSrc='images/no-avatar.png' 
                        waitingImage="images/Loading_icon.gif">
            </div>
            </fieldset>
   
            <input type='submit' name='submit' id='saveUser' value="Enregistrer" class="form-control btn-primary">
        </form>
        <div class="cancel">
            <button class="form-control btn-secondary" id="abortCreateProfilCmd">Annuler</button>
        </div>
    `);
    $('#loginCmd').on('click', renderLoginForm);
    initFormValidation(); // important do to after all html injection!
    initImageUploaders();
    $('#abortCreateProfilCmd').on('click', renderLoginForm);
    addConflictValidation(API.checkConflictURL(), 'Email', 'saveUser');
    $('#createProfilForm').on("submit", function (event) {
        let profil = getFormData($('#createProfilForm'));
        delete profil.matchedPassword;
        delete profil.matchedEmail;
        event.preventDefault();
        showWaitingGif();
        createProfil(profil);
    });
}
async function renderManageUsers() {
    timeout();
    let loggedUser = API.retrieveLoggedUser();
    if (loggedUser.isAdmin) {
        if (isVerified()) {
            showWaitingGif();
            UpdateHeader('Gestion des usagers', 'manageUsers')
            $("#newPhotoCmd").hide();
            $("#abort").hide();
            let users = await API.GetAccounts();
            if (API.error) {
                renderError();
            } else {
                $("#content").empty();
                users.data.forEach(user => {
                    if (user.Id != loggedUser.Id) {
                        let typeIcon = user.Authorizations.readAccess == 2 ? "fas fa-user-cog" : "fas fa-user-alt";
                        typeTitle = user.Authorizations.readAccess == 2 ? "Retirer le droit administrateur à" : "Octroyer le droit administrateur à";
                        let blockedClass = user.Authorizations.readAccess == -1 ? "class=' blockUserCmd cmdIconVisible fa fa-ban redCmd'" : "class='blockUserCmd cmdIconVisible fa-regular fa-circle greenCmd'";
                        let blockedTitle = user.Authorizations.readAccess == -1 ? "Débloquer $name" : "Bloquer $name";
                        let userRow = `
                        <div class="UserRow"">
                            <div class="UserContainer noselect">
                                <div class="UserLayout">
                                    <div class="UserAvatar" style="background-image:url('${user.Avatar}')"></div>
                                    <div class="UserInfo">
                                        <span class="UserName">${user.Name}</span>
                                        <a href="mailto:${user.Email}" class="UserEmail" target="_blank" >${user.Email}</a>
                                    </div>
                                </div>
                                <div class="UserCommandPanel">
                                    <span class="promoteUserCmd cmdIconVisible ${typeIcon} dodgerblueCmd" title="${typeTitle} ${user.Name}" userId="${user.Id}"></span>
                                    <span ${blockedClass} title="${blockedTitle}" userId="${user.Id}" ></span>
                                    <span class="removeUserCmd cmdIconVisible fas fa-user-slash goldenrodCmd" title="Effacer ${user.Name}" userId="${user.Id}"></span>
                                </div>
                            </div>
                        </div>           
                        `;
                        $("#content").append(userRow);
                    }
                });
                $(".promoteUserCmd").on("click", async function () {
                    let userId = $(this).attr("userId");
                    await API.PromoteUser(userId);
                    renderManageUsers();
                });
                $(".blockUserCmd").on("click", async function () {
                    let userId = $(this).attr("userId");
                    await API.BlockUser(userId);
                    renderManageUsers();
                });
                $(".removeUserCmd").on("click", function () {
                    let userId = $(this).attr("userId");
                    renderConfirmDeleteAccount(userId);
                });
            }
        } else
            renderVerify();
    } else
        renderLoginForm();
}
async function renderConfirmDeleteAccount(userId) {
    timeout();
    let loggedUser = API.retrieveLoggedUser();
    if (loggedUser) {
        let userToDelete = (await API.GetAccount(userId)).data;
        if (!API.error) {
            eraseContent();
            UpdateHeader("Retrait de compte", "confirmDeleteAccoun");
            $("#newPhotoCmd").hide();
            $("#content").append(`
                <div class="content loginForm">
                    <br>
                    <div class="form UserRow ">
                        <h4> Voulez-vous vraiment effacer cet usager et toutes ses photos? </h4>
                        <div class="UserContainer noselect">
                            <div class="UserLayout">
                                <div class="UserAvatar" style="background-image:url('${userToDelete.Avatar}')"></div>
                                <div class="UserInfo">
                                    <span class="UserName">${userToDelete.Name}</span>
                                    <a href="mailto:${userToDelete.Email}" class="UserEmail" target="_blank" >${userToDelete.Email}</a>
                                </div>
                            </div>
                        </div>
                    </div>           
                    <div class="form">
                        <button class="form-control btn-danger" id="deleteAccountCmd">Effacer</button>
                        <br>
                        <button class="form-control btn-secondary" id="abortDeleteAccountCmd">Annuler</button>
                    </div>
                </div>
            `);
            $("#deleteAccountCmd").on("click", function () {
                adminDeleteAccount(userToDelete.Id);
            });
            $("#abortDeleteAccountCmd").on("click", renderManageUsers);
        } else {
            renderError("Une erreur est survenue");
        }
    }
}
function renderEditProfilForm() {
    timeout();
    let loggedUser = API.retrieveLoggedUser();
    if (loggedUser) {
        eraseContent();
        UpdateHeader("Profil", "editProfil");
        $("#newPhotoCmd").hide();
        $("#content").append(`
            <br/>
            <form class="form" id="editProfilForm"'>
                <input type="hidden" name="Id" id="Id" value="${loggedUser.Id}"/>
                <fieldset>
                    <legend>Adresse ce courriel</legend>
                    <input  type="email" 
                            class="form-control Email" 
                            name="Email" 
                            id="Email"
                            placeholder="Courriel" 
                            required 
                            RequireMessage = 'Veuillez entrer votre courriel'
                            InvalidMessage = 'Courriel invalide'
                            CustomErrorMessage ="Ce courriel est déjà utilisé"
                            value="${loggedUser.Email}" >

                    <input  class="form-control MatchedInput" 
                            type="text" 
                            matchedInputId="Email"
                            name="matchedEmail" 
                            id="matchedEmail" 
                            placeholder="Vérification" 
                            required
                            RequireMessage = 'Veuillez entrez de nouveau votre courriel'
                            InvalidMessage="Les courriels ne correspondent pas" 
                            value="${loggedUser.Email}" >
                </fieldset>
                <fieldset>
                    <legend>Mot de passe</legend>
                    <input  type="password" 
                            class="form-control" 
                            name="Password" 
                            id="Password"
                            placeholder="Mot de passe" 
                            InvalidMessage = 'Mot de passe trop court' >

                    <input  class="form-control MatchedInput" 
                            type="password" 
                            matchedInputId="Password"
                            name="matchedPassword" 
                            id="matchedPassword" 
                            placeholder="Vérification" 
                            InvalidMessage="Ne correspond pas au mot de passe" >
                </fieldset>
                <fieldset>
                    <legend>Nom</legend>
                    <input  type="text" 
                            class="form-control Alpha" 
                            name="Name" 
                            id="Name"
                            placeholder="Nom" 
                            required 
                            RequireMessage = 'Veuillez entrer votre nom'
                            InvalidMessage = 'Nom invalide'
                            value="${loggedUser.Name}" >
                </fieldset>
                <fieldset>
                    <legend>Avatar</legend>
                    <div class='imageUploader' 
                            newImage='false' 
                            controlId='Avatar' 
                            imageSrc='${loggedUser.Avatar}' 
                            waitingImage="images/Loading_icon.gif">
                </div>
                </fieldset>

                <input type='submit' name='submit' id='saveUser' value="Enregistrer" class="form-control btn-primary">
                
            </form>
            <div class="cancel">
                <button class="form-control btn-secondary" id="abortEditProfilCmd">Annuler</button>
            </div>

            <div class="cancel">
                <hr>
                <button class="form-control btn-warning" id="confirmDelelteProfilCMD">Effacer le compte</button>
            </div>
        `);
        initFormValidation(); // important do to after all html injection!
        initImageUploaders();
        addConflictValidation(API.checkConflictURL(), 'Email', 'saveUser');
        $('#abortEditProfilCmd').on('click', renderPhotos);
        $('#confirmDelelteProfilCMD').on('click', renderConfirmDeleteProfil);
        $('#editProfilForm').on("submit", function (event) {
            let profil = getFormData($('#editProfilForm'));
            delete profil.matchedPassword;
            delete profil.matchedEmail;

            if(profil.VerifyCode == null)
             Object.assign(profil, { VerifyCode: "verified" });

            event.preventDefault();
            showWaitingGif();
            editProfil(profil);
        });
    }
}
function renderConfirmDeleteProfil() {
    timeout();
    let loggedUser = API.retrieveLoggedUser();
    if (loggedUser) {
        eraseContent();
        UpdateHeader("Retrait de compte", "confirmDeleteProfil");
        $("#newPhotoCmd").hide();
        $("#content").append(`
            <div class="content loginForm">
                <br>
                
                <div class="form">
                 <h3> Voulez-vous vraiment effacer votre compte? </h3>
                    <button class="form-control btn-danger" id="deleteProfilCmd">Effacer mon compte</button>
                    <br>
                    <button class="form-control btn-secondary" id="cancelDeleteProfilCmd">Annuler</button>
                </div>
            </div>
        `);
        $("#deleteProfilCmd").on("click", deleteProfil);
        $('#cancelDeleteProfilCmd').on('click', renderEditProfilForm);
    }
}
function renderExpiredSession() {
    noTimeout();
    loginMessage = "Votre session est expirée. Veuillez vous reconnecter.";
    logout();
    renderLoginForm();
}
function renderLoginForm() {
    noTimeout();
    eraseContent();
    UpdateHeader("Connexion", "Login");
    $("#newPhotoCmd").hide();
    $("#content").append(`
        <div class="content" style="text-align:center">
            <div class="loginMessage">${loginMessage}</div>
            <form class="form" id="loginForm">
                <input  type='email' 
                        name='Email'
                        class="form-control"
                        required
                        RequireMessage = 'Veuillez entrer votre courriel'
                        InvalidMessage = 'Courriel invalide'
                        placeholder="adresse de courriel"
                        value='${Email}'> 
                <span style='color:red'>${EmailError}</span>
                <input  type='password' 
                        name='Password' 
                        placeholder='Mot de passe'
                        class="form-control"
                        required
                        RequireMessage = 'Veuillez entrer votre mot de passe'
                        InvalidMessage = 'Mot de passe trop court' >
                <span style='color:red'>${passwordError}</span>
                <input type='submit' name='submit' value="Entrer" class="form-control btn-primary">
            </form>
            <div class="form">
                <hr>
                <button class="form-control btn-info" id="createProfilCmd">Nouveau compte</button>
            </div>
        </div>
    `);
    initFormValidation(); // important do to after all html injection!
    $('#createProfilCmd').on('click', renderCreateProfil);
    $('#loginForm').on("submit", function (event) {
        let credential = getFormData($('#loginForm'));
        event.preventDefault();
        showWaitingGif();
        login(credential);
    });
}
function getFormData($form) {
    const removeTag = new RegExp("(<[a-zA-Z0-9]+>)|(</[a-zA-Z0-9]+>)", "g");
    var jsonObject = {};
    console.log($form.serializeArray());
    $.each($form.serializeArray(), (index, control) => {
        jsonObject[control.name] = control.value.replace(removeTag, "");
    });
    return jsonObject;
}

