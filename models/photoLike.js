
export default class PhotoLike extends Model {
    
    constructor() {
      this.addField('ImageId', 'string');
      this.addField('LikeCounter', 'integer');       
      this.addField('LikedById', 'string');
      
      this.setKey("ImageId");
      }
    
    
}