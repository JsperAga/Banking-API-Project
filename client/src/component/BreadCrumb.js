// Breadcrumb.js
import React from 'react';
import { Link, useLocation } from 'react-router-dom';


function Breadcrumb() {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter(x => x);

  return (
    <nav aria-label="breadcrumb" className="breadcrumb-container">
      <ol className="breadcrumb">
        <li className="breadcrumb-item">
          <Link to="/">Home</Link>
        </li>
        {pathnames.map((value, index) => {
          const to = `/${pathnames.slice(0, index + 1).join('/')}`;
          return (
            <li key={to} className="breadcrumb-item">
              <Link to={to}>{value}</Link>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export default Breadcrumb;
