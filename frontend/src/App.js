import {useState, useEffect} from 'react';
import './App.css'
function App() {
  const [habits, setHabits] = useState([]);
  const [newhabit,setNewHabit] = useState('');
  const [analytics,setAnalytics] = useState([]);
  const [completedtoday, setCompletedToday] = useState([]);
  const [habiterror, setHabitError] = useState('');

  const fetchHabits = () => {
    fetch('http://localhost:5000/habits')
    .then(res => res.json())
    .then(data => setHabits(data));
  }
  const fetchAnalytics = () => {
    fetch('http://localhost:5000/analytics')
    .then(res => res.json())
    .then(data => setAnalytics(data));
  }
  const completeHabit = (habitId) => {
    const today = new Date().toISOString().split('T')[0];
    fetch('http://localhost:5000/completions', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({habit_id: habitId, date: today})
    }).then(() => fetchAnalytics())
    .then(() => fetchCompletedToday());
  };
  const fetchCompletedToday = () => {
    const today = new Date().toISOString().split('T')[0];
    fetch('http://localhost:5000/completions')
    .then(res => res.json())
    .then(data => {
      const todayIds = data
      .filter(c => c.date === today)
      .map(c => c.habit_id);
      setCompletedToday(todayIds);
    });
  };
  const deleteHabit = (habitId) => {
    fetch(`http://localhost:5000/habits/${habitId}`, {
      method: 'DELETE',
    }).then(() => {fetchHabits();
      fetchAnalytics();
    });
  };

  useEffect(() => {
    fetchHabits();
    fetchAnalytics();
    fetchCompletedToday();
  },[])
  return (
    <div>
      <h1>Habit Tracker</h1>
      {habits.map(habit => (
        <div className='habit-row' key={habit.id}>
        <span className='habit-name'>{habit.name}</span>
        {completedtoday.includes(habit.id)
        ? <button className='btn-completed' >Completed</button>
        : <button className='btn-complete'onClick={() => completeHabit(habit.id)}>✔</button>
        }
       <button className='btn-delete' onClick={() => deleteHabit(habit.id)}>X</button>
        </div>
      ))}
      <h2>Analytics</h2>
      {analytics.map(item => (
        <div className='analytics-row' key={item.name}>
          {item.name} : {item.completions} completions
        </div>
      ))}
      <div className='add-section'>
      <input type='text'
      value = {newhabit}
      onChange = {(e) => setNewHabit(e.target.value)}
      />
      <button onClick = {() =>
      fetch('http://localhost:5000/habits',{
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({name: newhabit})
      })
      .then(res => {
        if (res.status === 400)
        {
          setHabitError('Already exists');
        }
        else {
          fetchHabits();
          fetchAnalytics();
          setNewHabit('');
          setHabitError('')
        }
      }


      )
      }
      >Add Habit</button>
      {habiterror && 
      <span style={{marginLeft:'10px', color:'red'}}>{habiterror}</span>
      }
      </div>
    </div>
  );
}

export default App;
