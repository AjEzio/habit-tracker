import {useState, useEffect} from 'react';
import './App.css'
function App() {
  const [habits, setHabits] = useState([]);
  const [newhabit,setNewHabit] = useState('');
  const [analytics,setAnalytics] = useState([]);
  const [completedtoday, setCompletedToday] = useState([]);

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
        <p key={habit.id}>{habit.name}
        {completedtoday.includes(habit.id)
        ? <button >Completed</button>
        : <button onClick={() => completeHabit(habit.id)}>✔</button>
        }
       <button onClick={() => deleteHabit(habit.id)}>X</button>
        </p>
      ))}
      <h2>Analytics</h2>
      {analytics.map(item => (
        <p key={item.name}>
          {item.name}:{item.completions} completions
        </p>
      ))}
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
    .then(() => fetchHabits())
    .then(() => setNewHabit(''))
    .then(() => fetchAnalytics())
      }
      >Add Habit</button>
    </div>
  );
}

export default App;
