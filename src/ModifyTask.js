import React, { useState } from 'react';

function ModifyTask({ todos, modifyTodo }) {
  const [modifyId, setModifyId] = useState('');
  const [modifyText, setModifyText] = useState('');

  const handleModify = () => {
    if (modifyId && modifyText.trim()) {
      modifyTodo(Number(modifyId), modifyText);
      setModifyId('');
      setModifyText('');
    }
  };

  return (
    <div>
      <h2>Modify Task</h2>
      <input
        type="number"
        value={modifyId}
        onChange={(e) => setModifyId(e.target.value)}
        placeholder="Task ID"
      />
      <input
        type="text"
        value={modifyText}
        onChange={(e) => setModifyText(e.target.value)}
        placeholder="New text"
      />
      <button onClick={handleModify}>Modify</button>
    </div>
  );
}

export default ModifyTask;