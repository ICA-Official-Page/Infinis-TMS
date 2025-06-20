import React from 'react';
import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { useSelector } from 'react-redux';

ChartJS.register(ArcElement, Tooltip, Legend);

const baseColors = [
  '#C2E7D9',
  '#FF8C42',
  '#FFD700',
  '#0F084B',
  '#26408B',
];

const generateColors = (num) => {
  const colors = [];
  for (let i = 0; i < num; i++) {
    colors.push(baseColors[i % baseColors.length]);
  }
  return colors;
};

const OpenTicketCategorization = ({ openTickets }) => {
  const { user } = useSelector(store => store.user);

  const categoryCounts = openTickets?.reduce((acc, ticket) => {
    if (user?.designation?.includes('admin')) {
      const branch = ticket?.branch || 'Others';
      acc[branch] = (acc[branch] || 0) + 1;
    } else {
      const departments = ticket?.department || [];

      if (user?.designation === 'Team Leader') {
        departments.forEach(dep => {
          if (dep?.name === user?.department) {
            let users = [];
            if (Array.isArray(dep.users)) {
              users = dep.users;
            } else if (typeof dep.users === 'string') {
              users = [dep.users];
            }

            if (users.length > 0) {
              users.forEach(us => {
                acc[us] = (acc[us] || 0) + 1;
              });
            } else {
              acc['department'] = (acc['department'] || 0) + 1;
            }
          }
        });
      } else {
        departments.forEach(dep => {
          const name = dep?.name || 'Others';
          acc[name] = (acc[name] || 0) + 1;
        });
      }
    }
    return acc;
  }, {}) || {};

  const labels = Object.keys(categoryCounts);
  const values = Object.values(categoryCounts);

  const data = {
    labels,
    datasets: [
      {
        label: 'Open Tickets',
        data: values,
        backgroundColor: generateColors(labels.length),
        borderColor: '#fff',
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: 0,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          font: { size: 14, weight: 'bold' },
          usePointStyle: true,
        },
      },
      tooltip: {
        backgroundColor: '#333',
        titleFont: { size: 14 },
        bodyFont: { size: 12 },
        cornerRadius: 4,
      },
    },
    animation: {
      animateScale: true,
      animateRotate: true,
      duration: 1500,
      easing: 'easeInOutBounce',
      delay: (context) => context.dataIndex * 300,
    },
    hoverOffset: 8,
  };

  return (
    <div className="card">
      <h3 className="card-header">Open Ticket Categorization</h3>
      <div className="card-body">
        <Pie data={data} options={options} />
      </div>
    </div>
  );
};

export default OpenTicketCategorization;
