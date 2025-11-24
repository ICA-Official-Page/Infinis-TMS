import React, { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCommentDots } from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import URI from "../utills";
import toast from "react-hot-toast";

const TicketCard = ({
    selectedTicket,
    user,
    formatDate,
    formatTime,
    formatTat,
    tatBG,

    department,
    allUsers,
    myDept,
    addCommentOnTicket,
    handlePriorityUpdate,
    reAssignTicket,

    showPriorityUpdate,
    setShowPriorityUpdate,
    newPriority,
    setNewPriority,
    isCommentOpen,
    setIsCommentOpen,
    reAssignDiv,
    setReAssignDiv,
    reAssignto,
    setReAssignto,
    comment,
    setComment
}) => {
    const [ticketSettings, setTicketSettings] = useState({});
    const fetchTicketSettings = async () => {
        try {
            const branch = selectedTicket?.branch;
            const res = await axios.get(`${URI}/admin/getticketsettings/${branch}`, {
                headers: {
                    'Content-Type': 'application/json'
                }
            }).then(r => {
                setTicketSettings(r?.data?.ticketSettings);
            }).catch(err => {
                // Handle error and show toast
                if (err.response && err.response.data && err.response.data.message) {
                    toast.error(err.response.data.message); // For 400, 401, etc.
                } else {
                    toast.error("Something went wrong");
                }
            });
        } catch (error) {
            console.log('while fetching Ticket Settings', error);
        }
    }



    // Refs for detecting outside clicks on modals
    const priorityRef = useRef(null);
    const commentRef = useRef(null);
    const reAssignRef = useRef(null);

    // Outside click handler for Priority Update modal
    useEffect(() => {
        fetchTicketSettings();
        function handleClickOutside(event) {
            if (priorityRef.current && !priorityRef.current.contains(event.target)) {
                setShowPriorityUpdate(false);
                setNewPriority("");
            }
        }
        if (showPriorityUpdate) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [showPriorityUpdate]);

    // Outside click handler for Comment modal
    useEffect(() => {
        function handleClickOutside(event) {
            if (commentRef.current && !commentRef.current.contains(event.target)) {
                setIsCommentOpen(false);
            }
        }
        if (isCommentOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isCommentOpen]);

    // Outside click handler for ReAssign modal
    useEffect(() => {
        function handleClickOutside(event) {
            if (reAssignRef.current && !reAssignRef.current.contains(event.target)) {
                setReAssignDiv(false);
                setReAssignto({ name: "", users: [], description: "" });
            }
        }
        if (reAssignDiv) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [reAssignDiv]);

    const handleCheckboxChange = (e) => {
        const { value, checked } = e.target;
        setReAssignto((prev) => ({
            ...prev,
            users: checked ? [...prev.users, value] : prev.users.filter((u) => u !== value),
        }));
    };

    const onAddComment = () => {
        if (comment.trim()) {
            addCommentOnTicket(comment);
            setComment("");
        }
    };

    return (
        <div
            className="ticket-card bg-white rounded shadow p-4 space-y-4"
            style={{
                position: "relative",
                backgroundColor: '#fff',
                borderRadius: '12px',
                padding: '16px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                marginBottom: '16px',
                maxWidth: '600px',
                margin: 'auto'
            }}
        // style={{

        // **No onClick here that hides ticket!**
        >
            {/* Ticket ID & Status */}
            <div className="flex justify-between items-center">
                <div className="text-xl font-bold">#{selectedTicket?.ticketId}</div>
                <div className="flex gap-2 flex-wrap">
                    <span
                        className={`badge ${selectedTicket?.status === "open"
                            ? "badge-warning"
                            : selectedTicket?.status === "in-progress"
                                ? "badge-primary"
                                : "badge-success"
                            }`}
                    >
                        {selectedTicket?.status === "in-progress"
                            ? "In Progress"
                            : selectedTicket?.status?.charAt(0).toUpperCase() + selectedTicket?.status?.slice(1)}
                    </span>

                    {/* Priority Badge */}
                    {
                        user?.designation?.includes('admin') ?
                            <span
                                className="badge cursor-pointer"
                                style={{
                                    background: ticketSettings?.priorities?.find((p) => p?.name === selectedTicket?.priority)?.color,
                                    color: parseInt(ticketSettings?.priorities?.find(p => p?.name === selectedTicket?.priority)?.color?.replace('#', ''), 16) > 0xffffff / 2 ? '#000' : '#fff',
                                }}
                            // onClick={(e) => {
                            //     e.stopPropagation();
                            //     setShowPriorityUpdate(!showPriorityUpdate);
                            //     // Close other modals if open
                            //     setIsCommentOpen(false);
                            //     setReAssignDiv(false);
                            // }}
                            >
                                {selectedTicket?.priority?.charAt(0).toUpperCase() + selectedTicket?.priority?.slice(1)}
                            </span> :
                            <span
                                className="badge cursor-pointer"
                                style={{
                                    background: ticketSettings?.priorities?.find((p) => p?.name === selectedTicket?.priority)?.color,
                                }}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setShowPriorityUpdate(!showPriorityUpdate);
                                    // Close other modals if open
                                    setIsCommentOpen(false);
                                    setReAssignDiv(false);
                                }}
                            >
                                {selectedTicket?.priority?.charAt(0).toUpperCase() + selectedTicket?.priority?.slice(1)}
                            </span>
                    }

                    <span
                        className="badge"
                        style={{ background: selectedTicket?.tat && tatBG(selectedTicket?.tat, selectedTicket?.createdAt) }}
                    >
                        {selectedTicket?.tat && formatTat(selectedTicket?.tat, selectedTicket?.createdAt)}
                    </span>
                </div>
            </div>

            {/* Priority Update Modal */}
            {showPriorityUpdate && (
                <div
                    ref={priorityRef}
                    className="space-y-2 p-3 border rounded shadow bg-gray-50"
                    onClick={(e) => e.stopPropagation()} // stop clicks inside modal from closing ticket
                >
                    <select
                        className="form-select"
                        value={newPriority}
                        onChange={(e) => setNewPriority(e.target.value)}
                    >
                        <option value="">Select Priority</option>
                        {ticketSettings?.priorities?.map((curElem) => (
                            <option key={curElem?.name} value={curElem?.name}>
                                {curElem?.name}
                            </option>
                        ))}
                    </select>
                    <div className="flex gap-2 mt-2">
                        <button className="btn btn-sm btn-primary" onClick={handlePriorityUpdate} disabled={!newPriority}>
                            Update
                        </button>
                        <button
                            className="btn btn-sm btn-outline"
                            onClick={() => {
                                setShowPriorityUpdate(false);
                                setNewPriority("");
                            }}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {/* Ticket Info */}
            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    // gap: '12px',
                    marginBottom: '16px'
                }}
            >
                <p>
                    <strong>Name:</strong> {selectedTicket?.name}
                </p>
                <p>
                    <strong>Mobile:</strong> {selectedTicket?.mobile}
                </p>
                <p>
                    <strong>Subject:</strong> {selectedTicket?.subject}
                </p>
                <p>
                    <strong>Category:</strong> {selectedTicket?.category}
                </p>
                <p>
                    <strong>Status:</strong> {selectedTicket?.status}
                </p>
                <p>
                    <strong>Issued By:</strong> {selectedTicket?.issuedby === user?.username ? "You" : selectedTicket?.issuedby}
                </p>
                <p>
                    <strong>Branch:</strong> {selectedTicket?.branch}
                </p>
                <p>
                    <strong>Created At:</strong> {formatDate(selectedTicket?.createdAt)},{formatTime(selectedTicket?.createdAt)}
                </p>
            </div>

            {/* Department Info */}
            <div>
                <h5 className="font-semibold">Departments</h5>
                {
                    myDept ?
                        <div>
                            <span className="font-bold">
                                {myDept?.name}
                                {myDept?.description && ":"}
                            </span>
                            {myDept?.users?.length > 0 ? (
                                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "5px" }}>
                                    {myDept?.users?.map((user, idx) => (
                                        <span key={idx}>{user}</span>
                                    ))}
                                </div>
                            ) : (
                                <span>No Specific Member Involved.</span>
                            )}
                            <p className="text-sm mt-1" style={{ wordBreak: "break-word" }}>
                                {myDept?.description}
                            </p>
                        </div> :
                        <>
                            {
                                selectedTicket?.department?.map(myDept =>
                                    <div>
                                        <span className="font-bold">
                                            {myDept?.name}
                                            {myDept?.description && ":"}
                                        </span>
                                        {myDept?.users?.length > 0 ? (
                                            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "5px" }}>
                                                {myDept?.users?.map((user, idx) => (
                                                    <span key={idx}>{user}</span>
                                                ))}
                                            </div>
                                        ) : (
                                            <span>No Specific Member Involved.</span>
                                        )}
                                        <p className="text-sm mt-1" style={{ wordBreak: "break-word" }}>
                                            {myDept?.description}
                                        </p>
                                    </div>
                                )
                            }
                        </>
                }
            </div>

            {
                selectedTicket?.file && <div>
                    <a href={selectedTicket?.file}>View Attachment</a>
                </div>
            }

            {/* Comments */}
            {selectedTicket?.comments?.length > 0 && (
                <>
                    <button
                        className="notification-btn"
                        onClick={(e) => {
                            e.stopPropagation();
                            setIsCommentOpen(!isCommentOpen);
                            !user?.designation?.includes('admin') && setShowPriorityUpdate(false);
                            !user?.designation?.includes('admin') && setReAssignDiv(false);
                        }}
                    >
                        <FontAwesomeIcon icon={faCommentDots} />
                        <span className="notification-badge">{selectedTicket?.comments?.length}</span>
                    </button>
                    {isCommentOpen && (
                        <div
                            ref={commentRef}
                            className="space-y-2 p-3 border rounded shadow bg-gray-50 mt-2"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h5 className="font-semibold">Comments</h5>
                            {selectedTicket?.comments.map((comment) => (
                                <div key={comment?.id} className="p-2 bg-gray-100 rounded">
                                    <p className="text-sm" style={{ wordBreak: "break-word" }}>
                                        {comment?.content}
                                    </p>
                                    <p className="text-xs text-muted">
                                        {comment?.commenter} - {formatDate(comment?.createdAt)}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}

            {/* Reassign Ticket */}
            {
                !user?.designation?.includes('admin') &&
                (selectedTicket?.issuedby === `${user?.username}${user?.department ? ` - ${user.department}` : ''} (${user?.designation})` || (selectedTicket?.status !== 'resolved')) && selectedTicket?.status !== 'closed' && 
                 
                < div >
                <h5
                    className="btn btn-primary mt-4"
                    onClick={(e) => {
                        e.stopPropagation();
                        setReAssignDiv(!reAssignDiv);
                        setShowPriorityUpdate(false);
                        setIsCommentOpen(false);
                    }}
                >
                    ReAssign Ticket
                </h5>
                    {reAssignDiv && (
                <div
                    ref={reAssignRef}
                    className="space-y-2 p-3 border rounded shadow bg-gray-50 mt-2"
                    onClick={(e) => e.stopPropagation()}
                >
                    <select
                        className="form-select"
                        onChange={(e) => setReAssignto({ ...reAssignto, name: e.target.value })}
                        defaultValue=""
                    >
                        <option value="" disabled>
                            ReAssign the Ticket
                        </option>
                        {department?.map(
                            (curElem, index) =>
                                !selectedTicket?.department?.some((dept) => dept.name === curElem?.name) && (
                                    <option key={index} value={curElem?.name}>
                                        {curElem?.name}
                                    </option>
                                )
                        )}
                    </select>
                    <div className="deptcheckbox">
                        {allUsers
                            ?.filter((exe) => exe?.department === reAssignto?.name)
                            .map((exe, idx) => (
                                <label
                                    key={idx}
                                    style={{ display: "block", cursor: "pointer", marginTop: "4px" }}
                                >
                                    <input
                                        type="checkbox"
                                        value={exe?.username}
                                        onChange={handleCheckboxChange}
                                        checked={reAssignto?.users.includes(exe?.username)}
                                    />{" "}
                                    {exe.username}
                                </label>
                            ))}
                    </div>
                    <textarea
                        className="form-control"
                        rows={2}
                        placeholder="Add description"
                        value={reAssignto.description}
                        onChange={(e) => setReAssignto({ ...reAssignto, description: e.target.value })}
                    />
                    <button className="btn btn-success btn-sm mt-2" onClick={reAssignTicket}>
                        ReAssign
                    </button>
                </div>
            )}
        </div>
            }

{/* Add Comment Input */ }
<div className="mt-4">
    <textarea
        className="form-control"
        rows={3}
        placeholder="Add a comment"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        onClick={(e) => e.stopPropagation()} // Prevent hiding ticket on click
    />
    <button className="btn btn-primary mt-2" onClick={onAddComment} disabled={!comment.trim()}>
        Add Comment
    </button>
</div>
        </div >
    );
};

export default TicketCard;
