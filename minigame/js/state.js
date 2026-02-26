const KEY = "jslager26_state_v1";

export function loadState(){
  try{
    return JSON.parse(localStorage.getItem(KEY)) || { currentLocation: "jungscharhaus" };
  }catch{
    return { currentLocation: "jungscharhaus" };
  }
}

export function saveState(state){
  localStorage.setItem(KEY, JSON.stringify(state));
}
