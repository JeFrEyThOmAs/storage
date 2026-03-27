// import { useEffect, useState } from "react";
// import "./UserPage.css";
// import { BASE_URL } from "./components/DirectoryHeader";
// import { useNavigate } from "react-router-dom";

// export default function UsersPage() {
//   const [users, setUsers] = useState([]);
//   const [userName, setUserName] = useState("Guest User");
//   const [userRole, setUserRole] = useState("User");
//   const [userEmail , setUserEmail] = useState("");
//   const navigate = useNavigate();


//   const logoutUser = async (userId) => {
//     const logoutConfirmed = confirm("Are you sure you want to log out?");
//     if (!logoutConfirmed) {
//       return;
//     }
//     try {
//       const response = await fetch(`${BASE_URL}/users/${userId}/logout`, {
//         method: "POST",
//         credentials: "include",
//       });
//       if (response.ok) {
//         console.log("Logged out successfully");
//         fetchUsers();
//       } else {
//         console.error("Logout failed");
//       }
//     } catch (err) {
//       console.error("Logout error:", err);
//     }
//   };

//   const DeleteUser = async (userId) => {
//     const logoutConfirmed = confirm("Are you sure you want to log out?");
//     if (!logoutConfirmed) {
//       return;
//     }
//     try {
//       const response = await fetch(`${BASE_URL}/users/${userId}`, {
//         method: "DELETE",
//         credentials: "include",
//       });
//       if (response.ok) {
//         console.log("User deleted successfully");
//         fetchUsers();
//       } else {
//         console.error("Logout failed");
//       }
//     } catch (err) {
//       console.error("Logout error:", err);
//     }
//   };

//   useEffect(() => {
//     fetchUsers();
//     fetchUser();
//   }, []);

//   async function fetchUsers() {
//     try {
//       const response = await fetch(`${BASE_URL}/users`, {
//         credentials: "include",
//       });
//       if (response.ok) {
//         const data = await response.json();
//         setUsers(data);
//         console.log(data);
//       } else if (response.status === 403) {
//         navigate("/");
//       } else if (response.status === 401) {
//         navigate("/login");
//       } else {
//         // Handle other error statuses if needed
//         console.error("Error fetching users data", response.status);
//       }
//     } catch (err) {
//       console.error("Error fetching user info:", err);
//     }
//   }

//   async function fetchUser() {
//     try {
//       const response = await fetch(`${BASE_URL}/user`, {
//         credentials: "include",
//       });
//       if (response.ok) {
//         const data = await response.json();
//         // Set user info if logged in
//         setUserName(data.name);
//         setUserRole(data.role);
//         setUserEmail(data.email);
//         // setUserPicture(data.picture);
//         // setLoggedIn(true);
//       } else if (response.status === 401) {
//         navigate("/login");
//       } else {
//         // Handle other error statuses if needed
//         console.error("Error fetching user info:", response.status);
//       }
//     } catch (err) {
//       console.error("Error fetching user info:", err);
//     }
//   }

//   return (
//     <div className="users-container">
//       <h1 className="title">All Users</h1>
//       <p>
//         {userName}: {userRole}
//       </p>
//       <table className="user-table">
//         <thead>
//           <tr>
//             <th>Name</th>
//             <th>Email</th>
//             <th>Status</th>
//             <th></th>
//             {userRole === "Admin" && <th></th>}
//           </tr>
//         </thead>
//         <tbody>
//           {users.map((user) => (
//             <tr key={user.id}>
//               <td>{user.name}</td>
//               <td>{user.email}</td>
//               <td>{user.isLoggedIn ? "Logged In" : "Logged Out"}</td>
//               <td>
//                 <button
//                   className="logout-button"
//                   onClick={() => logoutUser(user.id)}
//                   disabled={!user.isLoggedIn}
//                 >
//                   Logout
//                 </button>
//               </td>

//               {userRole === "Admin" && (
//                 <td>
//                   <button
//                     className="logout-button delete-button"
//                     onClick={() => {
//                       DeleteUser(user.id);
//                     }}
//                     disabled={user.email === userEmail}
//                   >
//                     Delete
//                   </button>
//                 </td>
//               )}
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   );
// }

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  fetchAllUsers,
  fetchUser,
  deleteUserById,
  logoutUserById,
} from "./apis/userApi";

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [userName, setUserName] = useState("Guest User");
  const [userEmail, setUserEmail] = useState("");
  const [userRole, setUserRole] = useState("User");
  const navigate = useNavigate();

  const logoutUser = async (user) => {
    const confirmed = confirm(`You are about to logout ${user.email}`);
    if (!confirmed) return;
    try {
      await logoutUserById(user.id);
      fetchUsers();
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  const deleteUser = async (user) => {
    const confirmed = confirm(`You are about to delete ${user.email}`);
    if (!confirmed) return;
    try {
      await deleteUserById(user.id);
      fetchUsers();
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchCurrentUser();
  }, []);

  async function fetchUsers() {
    try {
      const data = await fetchAllUsers();
      setUsers(data);
    } catch (err) {
      if (err.response?.status === 403) navigate("/");
      else if (err.response?.status === 401) navigate("/login");
      else console.error("Fetching users failed:", err);
    }
  }

  async function fetchCurrentUser() {
    try {
      const data = await fetchUser();
      setUserName(data.name);
      setUserEmail(data.email);
      setUserRole(data.role);
    } catch (err) {
      if (err.response?.status === 401) navigate("/login");
      else console.error("Fetching user failed:", err);
    }
  }

  return (
    <div className="max-w-5xl mt-10 mx-4">
      <h1 className="text-3xl font-bold mb-6">All Users</h1>
      <p>
        <b>{userName}</b>: <i>({userRole})</i>
      </p>

      <table className="w-full mt-6 border-collapse">
        <thead>
          <tr>
            <th className="border p-3 bg-gray-200 text-left">Name</th>
            <th className="border p-3 bg-gray-200 text-left">Email</th>
            <th className="border p-3 bg-gray-200 text-left">Status</th>
            <th className="border p-3 bg-gray-200 text-left"></th>
            {userRole === "Admin" && (
              <th className="border p-3 bg-gray-200 text-left"></th>
            )}
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td className="border p-3">{user.name}</td>
              <td className="border p-3">{user.email}</td>
              <td className="border p-3">
                {user.isLoggedIn ? "Logged In" : "Logged Out"}
              </td>
              <td className="border p-3">
                <button
                  onClick={() => logoutUser(user)}
                  disabled={!user.isLoggedIn}
                  className={`px-3 py-1 text-sm text-white rounded ${
                    user.isLoggedIn
                      ? "bg-blue-600 hover:bg-blue-700"
                      : "bg-gray-400 cursor-not-allowed"
                  }`}
                >
                  Logout
                </button>
              </td>
              {userRole === "Admin" && (
                <td className="border p-3">
                  <button
                    onClick={() => deleteUser(user)}
                    disabled={user.email === userEmail}
                    className={`px-3 py-1 text-sm text-white rounded ${
                      user.email === userEmail
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-red-600 hover:bg-red-700"
                    }`}
                  >
                    Delete
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
