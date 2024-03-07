import React from "react";
import { useSelector } from "react-redux";
import { useRef } from "react";
import { useState, useEffect } from "react";
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from "firebase/storage";
import { app } from "../firebase";
import {
  updateUserStart,
  updateUserSuccess,
  updateUserFailure,
  deleteUserFailure,
  deleteUserStart,
  deleteUserSuccess,
  signOutUserStart,
  signOutUserFailure,
  signOutUserSuccess,
} from "../redux/user/userSlice";
import { useDispatch } from "react-redux";
import { Link } from 'react-router-dom';

export default function Profile() {
  const { currentUser, loading, error } = useSelector((state) => state.user);
  const fileRef = useRef(null);
  const [file, setFile] = useState(undefined);
  const [filePerc, setFilePerc] = useState(0);
  const [fileUploadError, setFileUploadError] = useState(false);
  const [formData, setFormData] = useState({});
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [showListingsError, setShowListingsError] = useState(false);
  const [userListings, setUserListings] = useState([]);
  const dispatch = useDispatch();
  // console.log(filePerc);
  // console.log(file);
  // console.log(formData);

  useEffect(() => {
    if (file) {
      handleFileUpload(file);
    }
  }, [file]);

  const handleFileUpload = (file) => {
    const storage = getStorage(app);
    const fileName = new Date().getTime() + file.name;
    const storageRef = ref(storage, fileName);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setFilePerc(Math.round(progress));
      },
      (error) => {
        // Handle unsuccessful uploads
        setFileUploadError(true);
        console.error("Upload error:", error);
      },
      () => {
        // Handle successful uploads
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          setFormData({ ...formData, avatar: downloadURL });
          // Update other form fields if needed
        });
        console.log("Upload complete");
      }
    );
  };
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      dispatch(updateUserStart());
      const res = await fetch(`/api/user/update/${currentUser._id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success === false) {
        dispatch(updateUserFailure(data.message));
        return;
      }
      dispatch(updateUserSuccess(data));
      setUpdateSuccess(true);
    } catch (error) {
      dispatch(updateUserFailure(error.message));
    }
  };
  const handleDeleteUser = async () => {
    try {
      dispatch(deleteUserStart());
      const res = await fetch(`/api/user/delete/${currentUser._id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success === false) {
        dispatch(deleteUserFailure(data.message));
        return;
      }
      dispatch(deleteUserSuccess(data));
    } catch (error) {
      dispatch(deleteUserFailure(error.message));
    }
  };
  const handleSignOut = async () => {
    try {
      dispatch(signOutUserStart());
      const res = await fetch("/api/auth/signout");
      const data = await res.json();
      if (data.success === false) {
        dispatch(signOutUserFailure(data.message));
        return;
      }
      dispatch(signOutUserSuccess(data));
    } catch (error) {
      dispatch(signOutUserFailure(error.message));
    }
  };
  const handleShowListings = async () =>{
    try {
      setShowListingsError(false);
      const res = await fetch(`/api/user/listings/${currentUser._id}`);
      const data = await res.json();
      if(data.success === false){
        setShowListingsError(true);
        return;
      }
      setUserListings(data);
    } catch (error) {
      setShowListingsError(true);
    }
  }

  return (
    <div className="p-3 max-w-lg mx-auto">
      <h1 className="text-3xl font-semibold text-center my-7">Profile</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          type="file"
          onChange={(e) => setFile(e.target.files[0])}
          ref={fileRef}
          hidden
          accept="image/*"
        />
        <img
          onClick={() => fileRef.current.click()}
          className="rounded-full h-24 w-24 object-cover cursor-pointer self-center mt-2"
          src={formData.avatar || currentUser.avatar}
          alt="Profile"
        />
        <p className="text-sm self-center ">
          {fileUploadError ? (
            <span className="text-red-700">
              Error: Image Upload Failed (Image should be less than 2MB)
            </span>
          ) : filePerc > 0 && filePerc < 100 ? (
            <span className="text-green-500">{`Uploading ${filePerc}%`}</span>
          ) : filePerc === 100 ? (
            <span className="text-green-700">Upload Complete</span>
          ) : (
            ""
          )}
        </p>
        <input
          type="text"
          defaultValue={currentUser.username}
          placeholder="username"
          id="username"
          className="border p-3 rounded-lg"
          onChange={handleChange}
        />
        <input
          type="text"
          defaultValue={currentUser.email}
          placeholder="email"
          id="email"
          className="border p-3 rounded-lg"
          onChange={handleChange}
        />
        <input
          type="password"
          placeholder="password"
          id="password"
          className="border p-3 rounded-lg"
          onChange={handleChange}
        />
        <button
          disabled={loading}
          className="bg-slate-700 text-white rounded-lg p-3 uppercase hover:opacity-95 disabled:opacity-80 "
        >
          {loading ? "Loading..." : "Update"}
        </button>
        <Link className="bg-green-700 text-white p-3 rounded-lg uppercase text-center hover:opacity-95" to={'/create-listing'}>Create a New Listing</Link>
      </form>

      <div className="flex justify-between mt-5 ">
        <span
          onClick={handleDeleteUser}
          className="text-red-700 cursor-pointer "
        >
          Delete Account
        </span>
        <span onClick={handleSignOut} className="text-red-700 cursor-pointer ">
          Sign Out
        </span>
      </div>
      <p className="text-red-700 mt-5">{error ? error : ""}</p>
      <p className="text-green-700 mt-5">
        {updateSuccess ? "User is Updated Successfully!" : ""}
      </p>
      <button onClick={handleShowListings} className="text-green-700 w-full" >Show Listings</button>
      <p className="text-red-700 mt-5" >{ showListingsError ? 'Error in showing Listings' : '' }</p>
      
      { userListings && userListings.length >0 &&
      <div className="flex flex-col gap-4">
        <h1 className="text-center mt-7 text-2xl font-semibold">Your Listings</h1>
        {userListings.map((listing) =>(
          <div key={listing._id} className="border rounded-lg p-3 flex justify-between items-center gap-4">
            <Link to={`listing/${listing._id}`}>
              <img className="h-16 w-18 object-contain " src={listing.imageUrls[0]} alt="Listing Image" />
            </Link>
            <Link className="text-slate-700 font-semibold hover:underline truncate flex-1" to={`listing/${listing._id}`}>
              <p className="">{listing.name}</p>
            </Link>
            <div className=" flex flex-col items-center">
            <button className="text-green-700 uppercase">Edit</button>
              <button className="text-red-700 uppercase">Delete</button>
            </div>
          </div>
        ))}
      </div>
      }
    </div>
  );
}
