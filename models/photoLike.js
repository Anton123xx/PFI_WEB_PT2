
export default class PhotoLike {
    
    constructor() {
        this.likes = 0;
        this.likedBy = new Set();
      }
    
      like(user) {
        if (!this.likedBy.has(user)) {
          this.likes++;
          this.likedBy.add(user);
          this.updateLikes();
        } else {
          console.log(`${user} has already liked this picture.`);
        }
      }
    
      unlike(user) {
        if (this.likedBy.has(user)) {
          this.likes--;
          this.likedBy.delete(user);
          this.updateLikes();
        } else {
          console.log(`${user} has not liked this picture.`);
        }
      }
    
}