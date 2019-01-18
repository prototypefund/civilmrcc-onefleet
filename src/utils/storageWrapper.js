var storageWrapper = function(){
  this.set = function(i, v){
    return localStorage.setItem(i, v);
  }
  this.get = function(i){
    return localStorage.getItem(i);
  }
}

export default new storageWrapper();