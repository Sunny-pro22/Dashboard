import React, { useState, useEffect, useRef } from 'react';
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const SentinelVision = () => {
  const ESP_CAM_IP = '192.168.53.238';
  const ESP_SENSOR_IP = '192.168.53.127';

  const streamUrl = `http://${ESP_CAM_IP}/stream`;
  const detectEntryUrl = `http://${ESP_SENSOR_IP}/detectEntry`;
  const detectExitUrl = `http://${ESP_SENSOR_IP}/detectExit`;

  const [entryCount, setEntryCount] = useState(0);
  const [exitCount, setExitCount] = useState(0);
  const [history, setHistory] = useState([]);
  const [capturedImages, setCapturedImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const videoRef = useRef(null);

  useEffect(() => {
    const checkDetection = async () => {
      try {
        const resEntry = await fetch(detectEntryUrl);
        const entryResult = await resEntry.text();
        let entryInc = 0;
        if (entryResult === '1') {
          setEntryCount(prev => prev + 1);
          entryInc = 1;
          const img = videoRef.current;
          if (img && img.complete) {
            const canvas = document.createElement('canvas');
            canvas.width = img.naturalWidth || 640;
            canvas.height = img.naturalHeight || 480;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            canvas.toBlob(blob => {
              if (blob) {
                const url = URL.createObjectURL(blob);
                setCapturedImages(prev => [
                  { id: Date.now(), url, timestamp: new Date().toLocaleTimeString() },
                  ...prev,
                ].slice(0, 20));
              }
            }, 'image/jpeg', 0.8);
          }
        }
        const resExit = await fetch(detectExitUrl);
        const exitResult = await resExit.text();
        let exitInc = 0;
        if (exitResult === '1') {
          setExitCount(prev => prev + 1);
          exitInc = 1;
        }
        const newTotal = entryCount + entryInc - (exitCount + exitInc);
        setHistory(prev => [
          ...prev.slice(-29),
          {
            time: new Date().toLocaleTimeString(),
            entries: entryCount + entryInc,
            exits: exitCount + exitInc,
            total: newTotal,
          },
        ]);
      } catch (error) {
        console.error('Detection error:', error);
      }
    };

    const interval = setInterval(checkDetection, 1000);
    return () => clearInterval(interval);
  }, [entryCount, exitCount]);

  const styles = {
    container: {
      padding: '20px',
      background: 'linear-gradient(135deg, #111827, #1f2937)',
      minHeight: '100vh',
      color: '#e5e7eb',
      fontFamily: 'Segoe UI, sans-serif',
    },
    header: { textAlign: 'center', marginBottom: '20px', fontSize: '2.5rem' },
    statusContainer: {
      display: 'flex',
      justifyContent: 'center',
      gap: '20px',
      marginBottom: '20px',
    },
    statusBox: {
      backgroundColor: '#374151',
      padding: '15px 30px',
      borderRadius: '12px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
      display: 'flex',
      alignItems: 'center',
    },
    statusLabel: { marginRight: '10px', fontSize: '1.2rem' },
    statusValue: { fontSize: '1.8rem', fontWeight: 'bold' },
    videoContainer: {
      position: 'relative',
      width: '80vw',
      height: '45vw',
      maxWidth: '800px',
      maxHeight: '450px',
      margin: '0 auto 30px',
      overflow: 'hidden',
      borderRadius: '12px',
      boxShadow: '0 8px 10px rgba(0,0,0,0.4)',
    },
    fullscreenButton: {
      position: 'absolute',
      top: '10px',
      right: '10px',
      background: 'rgba(0,0,0,0.5)',
      border: 'none',
      borderRadius: '4px',
      padding: '5px 8px',
      fontSize: '1rem',
      color: '#fff',
      cursor: 'pointer',
    },
    video: { width: '100%', height: '100%', objectFit: 'cover' },
    chartContainer: { width: '100%', height: '300px', marginBottom: '30px' },
    galleryContainer: { maxWidth: '1200px', margin: '0 auto' },
    galleryTitle: { marginBottom: '20px', fontSize: '1.8rem', color: '#4ADE80' },
    galleryGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
      gap: '20px',
    },
    imageCard: {
      backgroundColor: '#374151',
      borderRadius: '12px',
      overflow: 'hidden',
      boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
      cursor: 'pointer',
      transition: 'transform 0.2s',
    },
    thumbnail: { width: '100%', height: '180px', objectFit: 'cover' },
    imageTimestamp: { padding: '8px', textAlign: 'center', fontSize: '0.85rem', color: '#d1d5db' },
    modalOverlay: {
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
      backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
    },
    modalContent: {
      position: 'relative', backgroundColor: '#111827', borderRadius: '12px', padding: '20px',
      maxWidth: '90%', maxHeight: '90%', display: 'flex', flexDirection: 'column', alignItems: 'center',
    },
    fullImage: { maxWidth: '100%', maxHeight: '80vh', borderRadius: '8px' },
    downloadButton: {
      marginTop: '15px', padding: '10px 20px', borderRadius: '8px', backgroundColor: '#10B981', color: '#fff', textDecoration: 'none', fontWeight: 'bold',
    },
    closeButton: {
      position: 'absolute', top: '10px', right: '10px', background: 'transparent', border: 'none', fontSize: '1.5rem', color: '#f87171', cursor: 'pointer',
    },
  };

  const enterFullScreen = () => {
    const elem = videoRef.current.parentElement;
    if (elem.requestFullscreen) elem.requestFullscreen();
    else if (elem.webkitRequestFullscreen) elem.webkitRequestFullscreen();
    else if (elem.msRequestFullscreen) elem.msRequestFullscreen();
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.header}>🛡️ Sentinel Vision Enhanced</h1>

      <div style={styles.statusContainer}>
        <div style={styles.statusBox}>
          <span style={styles.statusLabel}>🔼 Entries:</span>
          <span style={{ ...styles.statusValue, color: '#4ADE80' }}>{entryCount}</span>
        </div>
        <div style={styles.statusBox}>
          <span style={styles.statusLabel}>🔽 Exits:</span>
          <span style={{ ...styles.statusValue, color: '#F87171' }}>{exitCount}</span>
        </div>
        <div style={styles.statusBox}>
          <span style={styles.statusLabel}>📊 In Room:</span>
          <span style={{ ...styles.statusValue, color: '#60A5FA' }}>{entryCount - exitCount}</span>
        </div>
      </div>

      <div style={styles.videoContainer}>
        <button onClick={enterFullScreen} style={styles.fullscreenButton}>⛶</button>
        <img ref={videoRef} src={streamUrl} style={styles.video} alt="Live Stream" crossOrigin="anonymous" />
      </div>

      <div style={styles.chartContainer}>
        <ResponsiveContainer>
          <LineChart data={history} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="entries" stroke="#4ADE80" />
            <Line type="monotone" dataKey="exits" stroke="#F87171" />
            <Line type="monotone" dataKey="total" stroke="#60A5FA" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div style={styles.galleryContainer}>
        <h2 style={styles.galleryTitle}>Captured Photos ({capturedImages.length})</h2>
        <div style={styles.galleryGrid}>
          {capturedImages.map(image => (
            <div key={image.id} style={styles.imageCard} onClick={() => setSelectedImage(image)}>
              <img src={image.url} style={styles.thumbnail} alt={`Detection ${image.id}`} />
              <div style={styles.imageTimestamp}>{image.timestamp}</div>
            </div>
          ))}
        </div>
      </div>

      {selectedImage && (
        <div style={styles.modalOverlay} onClick={() => setSelectedImage(null)}>
          <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
            <img src={selectedImage.url} style={styles.fullImage} alt="Full view" />
            <a href={selectedImage.url} download={`capture_${selectedImage.id}.jpg`} style={styles.downloadButton}>
              ⬇️ Download
            </a>
            <button onClick={() => setSelectedImage(null)} style={styles.closeButton}>✖️</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SentinelVision;
