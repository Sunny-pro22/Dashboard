import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { motion } from 'framer-motion';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';  
import './Door.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function DoorSensorDashboard() {
  const [status, setStatus] = useState({ enter: 0, exit: 0, total: 0 });
  const espIP = 'http://192.168.52.127';

  const fetchStatus = async () => {
    try {
      const response = await fetch(`${espIP}/status`);
      const data = await response.json();
      setStatus(data);
    } catch (error) {
      console.error('Error fetching status:', error);
    }
  };

  useEffect(() => {
    const intervalId = setInterval(fetchStatus, 2000);
    return () => clearInterval(intervalId);
  }, []);

  const chartData = {
    labels: ['Entered', 'Exited', 'In Room'],
    datasets: [
      {
        label: 'Count',
        data: [status.enter, status.exit, status.total],
        backgroundColor: [
          'rgba(75, 192, 192, 0.8)',
          'rgba(255, 99, 132, 0.8)',
          'rgba(54, 162, 235, 0.8)',
        ],
        borderColor: [
          'rgba(75, 192, 192, 1)',
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    animation: {
      duration: 1500,
      easing: 'easeOutBounce',
    },
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#ffffff',
          font: {
            family: 'Helvetica, Arial, sans-serif',
            size: 14,
          },
        },
      },
      title: {
        display: true,
        text: 'Door Sensor Data',
        color: '#ffffff',
        font: {
          size: 22,
          family: 'Helvetica, Arial, sans-serif',
        },
      },
    },
    scales: {
      x: {
        ticks: {
          color: '#ffffff',
          font: {
            family: 'Helvetica, Arial, sans-serif',
            size: 14,
          },
        },
      },
      y: {
        ticks: {
          color: '#ffffff',
          font: {
            family: 'Helvetica, Arial, sans-serif',
            size: 14,
          },
        },
      },
    },
  };

  return (
    <motion.div
      className="container"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1 }}
    >
      <h1 className="title">🚪 Door Sensor Dashboard</h1>
      <div className="dashboard">
        <motion.div
          className="data-container"
          whileHover={{ scale: 1.03 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            className="card"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1 }}
          >
            <div className="stat">
              <span className="icon">👤</span>
              <span className="label">Entered:</span>
              <span className="value">{status.enter}</span>
            </div>
            <div className="stat">
              <span className="icon">🏃‍♂️</span>
              <span className="label">Exited:</span>
              <span className="value">{status.exit}</span>
            </div>
            <div className="stat">
              <span className="icon">🧍‍♂️</span>
              <span className="label">In Room:</span>
              <span className="value">{status.total}</span>
            </div>
          </motion.div>
        </motion.div>

        <motion.div
          className="chart-container"
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1 }}
        >
          <Bar data={chartData} options={chartOptions} />
        </motion.div>
      </div>
    </motion.div>
  );
}

export default DoorSensorDashboard;
