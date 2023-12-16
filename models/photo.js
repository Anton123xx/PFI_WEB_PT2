import Model from './model.js';
import UserModel from './user.js';
import PhotoLikeModel from './photoLike.js';/////WHAT THE FUCK
import Repository from '../models/repository.js';

export default class Photo extends Model {
    constructor()
    {
        super();
        this.addField('Title', 'string');        
        this.addField('Description', 'string');
        this.addField('Image', 'asset');
        this.addField('OwnerId', 'string');
        this.addField('Date','integer');
        this.addField('Shared','boolean');
///AJOUTER LIKE COUNTER ???????????
        //this.addField('LikeCounter', 'integer') = new PhotoLikeModel();
        this.setKey("Title");
    }
}