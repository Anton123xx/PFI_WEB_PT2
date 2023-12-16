import Authorizations from '../authorizations.js';
import Repository from '../models/repository.js';
import PhotoLikeModel from '../models/photoLike.js';
import Controller from './Controller.js';

export default
    class PhotosLike extends Controller {
    constructor(HttpContext) {
        super(HttpContext, new Repository(new PhotoLikeModel()), Authorizations.anonymous());
       //this.photoLikesRepository = new Repository(new PhotoLikeModel());
    }

    create(photoLike)
    {
        if (this.repository != null) {
            let newPhotoLike = this.repository.add(photoLike);
            this.HttpContext.response.created(newPhotoLike);
            
        } else
            this.HttpContext.response.notImplemented();
    }

    unlike(id){ // warning! this is not an API endpoint
        super.remove(id);
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