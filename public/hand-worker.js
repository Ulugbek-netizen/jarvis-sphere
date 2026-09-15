let detector;
self.onmessage = async ({ data }) => {
  try {
    if (data.type === 'init') {
      const { FilesetResolver, HandLandmarker } = await import('/vendor/vision_bundle.mjs');
      const vision = await FilesetResolver.forVisionTasks('/vendor/wasm');
      detector = await HandLandmarker.createFromOptions(vision, { baseOptions: { modelAssetPath: '/models/hand_landmarker.task', delegate: 'CPU' }, runningMode: 'VIDEO', numHands: 2, minHandDetectionConfidence: .55, minTrackingConfidence: .55 });
      self.postMessage({ type: 'ready' });
    } else if (data.type === 'frame') {
      try { const result = detector.detectForVideo(data.frame, data.time); self.postMessage({ type: 'landmarks', hands: result.landmarks || [] }); }
      finally { data.frame.close(); }
    }
  } catch { self.postMessage({ type: 'error', message: 'Hand tracking could not start. Use a current browser with WebAssembly support.' }); }
};
