import React, { useRef, useState } from 'react';
import SignatureCanvas from 'react-signature-canvas';

const SignaturePad = ({ onSave, existingSignature = null }) => {
  const sigCanvas = useRef(null);
  const [isEmpty, setIsEmpty] = useState(true);

  const clear = () => {
    sigCanvas.current.clear();
    setIsEmpty(true);
  };

  const save = () => {
    if (!sigCanvas.current.isEmpty()) {
      const dataUrl = sigCanvas.current.toDataURL('image/png');
      onSave(dataUrl);
      setIsEmpty(false);
    }
  };

  const handleEnd = () => {
    setIsEmpty(sigCanvas.current.isEmpty());
  };

  return (
    <div className="space-y-4">
      <div className="border-2 border-gray-300 rounded-lg bg-white">
        {existingSignature ? (
          <div className="p-4">
            <img src={existingSignature} alt="Signature" className="max-h-40 mx-auto" />
          </div>
        ) : (
          <SignatureCanvas
            ref={sigCanvas}
            canvasProps={{
              className: 'w-full h-40',
              style: { cursor: 'crosshair' }
            }}
            onEnd={handleEnd}
          />
        )}
      </div>
      
      <div className="flex gap-2 justify-end">
        {existingSignature ? (
          <button
            onClick={() => onSave(null)}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Hapus Tanda Tangan
          </button>
        ) : (
          <>
            <button
              onClick={clear}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Hapus
            </button>
            <button
              onClick={save}
              disabled={isEmpty}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              Simpan Tanda Tangan
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default SignaturePad;
