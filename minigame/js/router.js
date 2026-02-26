export function setRoute(hash){
  location.hash = hash;
}
export function getRoute(){
  return location.hash.replace("#","") || "login";
}
