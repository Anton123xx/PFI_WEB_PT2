import Model from './model.js';

export default class PhotoLike extends Model { 
    constructor() {
      super();
      this.addField('ImageId', 'string');   
      this.addField('LikedById', 'string');
      }
    
    
}