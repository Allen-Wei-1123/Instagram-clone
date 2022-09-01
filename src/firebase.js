// Import the functions you need from the SDKs you need
import firebase,{ initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getStorage} from 'firebase/storage'
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC9Fr1GMSERWu3USqr2CeaXBchWeaxsrKU",
  authDomain: "my-app-58edd.firebaseapp.com",
  projectId: "my-app-58edd",
  storageBucket: "my-app-58edd.appspot.com",
  messagingSenderId: "384616742127",
  appId: "1:384616742127:web:12b12c8390c66a21c62f1a",
  measurementId: "G-4MTE5S8NXH"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const storage = getStorage(app);
