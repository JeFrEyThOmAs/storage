// import { useEffect, useRef } from "react";

// function RenameModal({
//   renameType,
//   renameValue,
//   setRenameValue,
//   onClose,
//   onRenameSubmit,
// }) {
//   const inputRef = useRef(null);

//   useEffect(() => {
//     // Focus and select text only once on mount
//     if (inputRef.current) {
//       inputRef.current.focus();

//       const dotIndex = renameValue.lastIndexOf(".");
//       if (dotIndex > 0) {
//         inputRef.current.setSelectionRange(0, dotIndex);
//       } else {
//         inputRef.current.select();
//       }
//     }

//     // Listen for "Escape" key to close the modal
//     const handleKeyDown = (e) => {
//       if (e.key === "Escape") {
//         onClose();
//       }
//     };
//     document.addEventListener("keydown", handleKeyDown);

//     // Cleanup keydown event listener on unmount
//     return () => {
//       document.removeEventListener("keydown", handleKeyDown);
//     };
//   }, []);

//   // Stop propagation when clicking inside the content
//   const handleContentClick = (e) => {
//     e.stopPropagation();
//   };

//   // Close when clicking outside the modal content
//   const handleOverlayClick = () => {
//     onClose();
//   };

//   return (
//     <div className="modal-overlay" onClick={handleOverlayClick}>
//       <div className="modal-content" onClick={handleContentClick}>
//         <h2>Rename {renameType === "file" ? "File" : "Folder"}</h2>
//         <form onSubmit={onRenameSubmit}>
//           <input
//             ref={inputRef}
//             type="text"
//             className="modal-input"
//             placeholder="Enter new name"
//             value={renameValue}
//             onChange={(e) => setRenameValue(e.target.value)}
//           />
//           <div className="modal-buttons">
//             <button className="primary-button" type="submit">
//               Save
//             </button>
//             <button
//               className="secondary-button"
//               type="button"
//               onClick={onClose}
//             >
//               Cancel
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// }

// export default RenameModal;

import { useEffect, useRef } from "react";

function RenameModal({
  renameType,
  renameValue,
  setRenameValue,
  onClose,
  onRenameSubmit,
}) {
  const inputRef = useRef(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
      const dotIndex = renameValue.lastIndexOf(".");
      if (dotIndex > 0) {
        inputRef.current.setSelectionRange(0, dotIndex);
      } else {
        inputRef.current.select();
      }
    }

    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white p-6 rounded-lg shadow-md w-[90%] max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold mb-4">
          Rename {renameType === "file" ? "File" : "Folder"}
        </h2>
        <form onSubmit={onRenameSubmit}>
          <input
            ref={inputRef}
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter new name"
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
          />
          <div className="flex justify-end gap-2 mt-4">
            <button
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              type="submit"
            >
              Save
            </button>
            <button
              className="bg-gray-300 text-black px-4 py-2 rounded hover:bg-gray-400"
              type="button"
              onClick={onClose}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default RenameModal;
