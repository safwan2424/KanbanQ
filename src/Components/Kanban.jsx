import React, { useState, useEffect } from 'react'; 
import axios from 'axios';
import { ChevronDown, MoreHorizontal, Circle, CheckCircle2, Clock, XCircle } from 'lucide-react';
import PriorityIcon from '../assets/Display.svg'; 
import './Kanban.css';  

import UrgentIcon from '../assets/SVG - Urgent Priority grey.svg';
import HighIcon from '../assets/Img - High Priority.svg';
import MediumIcon from '../assets/Img - Medium Priority.svg';
import LowIcon from '../assets/Img - Low Priority.svg';
import NoPriorityIcon from '../assets/No-priority.svg';

const priorityInfo = {
  4: { name: 'Urgent', icon: UrgentIcon, color: 'red' },
  3: { name: 'High', icon: HighIcon, color: 'orange' },
  2: { name: 'Medium', icon: MediumIcon, color: 'yellow' },
  1: { name: 'Low', icon: LowIcon, color: 'blue' },
  0: { name: 'No priority', icon: NoPriorityIcon, color: 'gray' },
};

const statusInfo = {
  'Todo': { icon: Circle, color: 'gray' },
  'In progress': { icon: Clock, color: 'blue' },
  'Done': { icon: CheckCircle2, color: 'green' },
  'Canceled': { icon: XCircle, color: 'red' },
};

const Kanban = () => {
  const [tickets, setTickets] = useState([]);
  const [users, setUsers] = useState([]);
  const [grouping, setGrouping] = useState('status');
  const [sorting, setSorting] = useState('priority');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('https://api.quicksell.co/v1/internal/frontend-assignment');
        setTickets(response.data.tickets);
        setUsers(response.data.users);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, []);


  useEffect(() => {
    const savedState = localStorage.getItem('kanbanState');
    if (savedState) {
      const { grouping, sorting } = JSON.parse(savedState);
      setGrouping(grouping);
      setSorting(sorting);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('kanbanState', JSON.stringify({ grouping, sorting }));
  }, [grouping, sorting]);


  const groupTickets = () => {
    const grouped = {};
    tickets.forEach(ticket => {
      let key;
      if (grouping === 'status') {
        key = ticket.status;
      } else if (grouping === 'user') {
        const user = users.find(u => u.id === ticket.userId);
        key = user ? user.name : 'Unassigned';
      } else if (grouping === 'priority') {
        key = priorityInfo[ticket.priority].name;
      }
      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(ticket);
    });

  
    Object.keys(grouped).forEach(key => {
      grouped[key].sort((a, b) => {
        if (sorting === 'priority') {
          return b.priority - a.priority;
        } else {
          return a.title.localeCompare(b.title);
        }
      });
    });

    return grouped;
  };

  const groupedTickets = groupTickets();

  return (
    <div className="kanban-board">
    
      <nav className="navbar">
        <div className="navbar-container">
          
          <div className="navbar-left">
            <img src={PriorityIcon} alt="Priority" className="top-left-icon" />
            <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="navbar-btn">
              Display
              <ChevronDown className="icon" />
            </button>
          </div>
          {isDropdownOpen && (
            <div className="dropdown">
              <div className="dropdown-content">
                <div className="dropdown-item">
                  <label>Grouping</label>
                  <select value={grouping} onChange={(e) => setGrouping(e.target.value)}>
                    <option value="status">Status</option>
                    <option value="user">User</option>
                    <option value="priority">Priority</option>
                  </select>
                </div>
                <div className="dropdown-item">
                  <label>Ordering</label>
                  <select value={sorting} onChange={(e) => setSorting(e.target.value)}>
                    <option value="priority">Priority</option>
                    <option value="title">Title</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      <div className="main-content">
        <div className="ticket-groups">
          {Object.entries(groupedTickets).map(([group, tickets]) => (
            <div key={group} className="ticket-group">
              <div className="ticket-group-header">
                <h3 className="group-title">{group} <span className="group-count">({tickets.length})</span></h3>
              </div>
              <ul className="ticket-list">
                {tickets.map(ticket => {
                  const status = statusInfo[ticket.status] || { icon: Circle, color: 'gray' };
                  const user = users.find(u => u.id === ticket.userId) || {};
                  const priority = priorityInfo[ticket.priority];

                  return (
                    <li key={ticket.id} className="ticket">
                      <div className="ticket-header">
                        <p className="ticket-id">{ticket.id}</p>
                      
                        {user.avatar && <img src={user.avatar} alt={user.name} className="user-avatar" />}
                      </div>
                      <div className="ticket-body">
                      
                        {React.createElement(status.icon, { className: `icon ${status.color}` })}
                        <p className="ticket-title">{ticket.title}</p>
                      
                        {priority && <img src={priority.icon} alt={priority.name} className="priority-icon" />}
                      </div>
                    
                      <div className="ticket-footer">
                        <span className="feature-tag">
                          {ticket.type === 'Feature Request' && (
                            <>
                              <Circle className="tag-icon" />
                              Feature Request
                            </>
                          )}
                        </span>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Kanban;
