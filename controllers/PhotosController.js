import Authorizations from '../authorizations.js';
import Repository from '../models/repository.js';
import PhotoModel from '../models/photo.js';
import PhotoLikeModel from '../models/photoLike.js';
import Controller from './Controller.js';

export default
    class Photos extends Controller {
    constructor(HttpContext) {
        super(HttpContext, new Repository(new PhotoModel()));
       this.photoLikesRepository = new Repository(new PhotoLikeModel());
    }

    upload(photo)
    {
        if (this.repository != null) {
            let newPhoto = this.repository.add(photo);
            if (this.repository.model.state.isValid) {
                this.HttpContext.response.created(newPhoto);
            } else {
                if (this.repository.model.state.inConflict)
                    this.HttpContext.response.conflict(this.repository.model.state.errors);
                else
                    this.HttpContext.response.badRequest(this.repository.model.state.errors);
            }
        } else
            this.HttpContext.response.notImplemented();
    }

    modify(photo) {
        // empty asset members imply no change and there values will be taken from the stored record
            if (this.repository != null) {
                let foundedPhoto = this.repository.findByField("Id", photo.Id);
                if (foundedPhoto != null) {
                    let updatedphoto = this.repository.update(photo.Id, photo);
                    if (this.repository.model.state.isValid) {
                        this.HttpContext.response.updated(updatedphoto);
                    }
                    else {
                        if (this.repository.model.state.inConflict){
                            console.log("Conflict");
                            this.HttpContext.response.conflict(this.repository.model.state.errors);
                        }
                        else{
                            console.log("Bad request");
                            this.HttpContext.response.badRequest(this.repository.model.state.errors);
                        }
                    }
                } else{
                    console.log("not found");
                    this.HttpContext.response.notFound();
                }
                    
            } else{
                console.log("not Implemented");
                this.HttpContext.response.notImplemented();
            }
                
    }
    
    remove(id) { // warning! this is not an API endpoint
            super.remove(id);
            this.photoLikesRepository.keepByFilter(like => like.ImageId != id);
    }

    /*
    like()
    {
     
    }

    unLike()
    {

    }

    delete()
    {

    }

*/
}