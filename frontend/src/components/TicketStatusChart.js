import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
} from 'chart.js';

// Register necessary chart elements
ChartJS.register(ArcElement, Tooltip, Legend);

const TicketStatusChart = ({ ticket }) => {

    const openTicket = ticket?.filter(tckt => tckt?.status === 'open')?.length || 0;
    const inprogressTicket = ticket?.filter(tckt => tckt?.status === 'in-progress')?.length || 0;
    const resolveTicket = ticket?.filter(tckt => tckt?.status === 'resolved')?.length || 0;

    const data = {
        labels: ['Open', 'In Progress', 'Resolved'],
        datasets: [
            {
                label: 'Tickets',
                data: [openTicket, inprogressTicket, resolveTicket], // replace with your real data
                backgroundColor: [
                    '#0F084B', // Open - Red
                    '#26408B', // In Progress - Blue
                    '#C2E7D9', // Resolved - Yellow
                ],
                borderColor: ['#fff'],
                borderWidth: 2,
            },
        ],
    };

    const options = {
        animation: {
            animateScale: true,
            animateRotate: true,
            duration: 1200,
            easing: 'easeOutBounce',
        },
        interaction: {
            mode: 'nearest',
            intersect: true,
        },
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    font: {
                        size: 14,
                        weight: 'bold',
                    },
                    usePointStyle: true,
                    pointStyle: 'circle',
                },
            },
            tooltip: {
                enabled: true,
                backgroundColor: '#333',
                titleFont: { size: 14 },
                bodyFont: { size: 12 },
                cornerRadius: 4,
            },
        },
        cutout: '60%',
        responsive: true,
        maintainAspectRatio: false,
        hoverOffset: 8, // <-- This makes the hovered segment pop out
    };



    return (
        <div className='card'>
            <h3 className='card-header'>Ticket Status Overview</h3>
            <div className="card-body">
                {/* <div className="table-responsivee"> */}
                    <Doughnut data={data} options={options} />
                {/* </div> */}
            </div>
        </div>
    );
};

export default TicketStatusChart;
