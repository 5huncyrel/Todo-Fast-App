import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Switch,
} from 'react-native';

export default function TodoList() {
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState("all");
  const [darkMode, setDarkMode] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");
  const [editingText, setEditingText] = useState("");

  const BASE_URL = "https://todo-fast-app.onrender.com";

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await fetch(`${BASE_URL}/todos/`);
      const data = await response.json();
      setTasks(data);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  const addTask = async () => {
    if (editText.trim()) {
      const newTask = { title: editText, completed: false };

      const response = await fetch(`${BASE_URL}/todos/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTask),
      });

      if (response.ok) {
        fetchTasks();
        setEditText("");
      }
    }
  };

  const updateTask = async (id) => {
    const updatedTask = {
      title: editingText,
      completed: tasks.find((task) => task.id === id).completed,
    };

    const response = await fetch(`${BASE_URL}/todos/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedTask),
    });

    if (response.ok) {
      fetchTasks();
      setEditingId(null);
      setEditingText("");
    }
  };

  const toggleComplete = async (id) => {
    const taskToUpdate = tasks.find((task) => task.id === id);
    const updatedTask = { ...taskToUpdate, completed: !taskToUpdate.completed };

    const response = await fetch(`${BASE_URL}/todos/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedTask),
    });

    if (response.ok) {
      fetchTasks();
    }
  };

  const deleteTask = async (id) => {
    const response = await fetch(`${BASE_URL}/todos/${id}`, {
      method: "DELETE",
    });

    if (response.ok) {
      fetchTasks();
    }
  };

  const filteredTasks = tasks.filter((task) => {
    if (filter === "completed") return task.completed;
    if (filter === "pending") return !task.completed;
    return true;
  });

  return (
    <View style={[styles.container, darkMode && styles.darkContainer]}>
      <Text style={[styles.header, darkMode && styles.headerDark]}>
        📝 Todo List App
      </Text>

      <View style={styles.inputContainer}>
        <TextInput
          style={[styles.input, darkMode && styles.inputDark]}
          placeholder="Add new task..."
          placeholderTextColor={darkMode ? "#aaa" : "#555"}
          value={editText}
          onChangeText={setEditText}
        />
        <TouchableOpacity style={styles.addButton} onPress={addTask}>
          <Text style={styles.buttonText}>➕</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.toggleContainer}>
        <Text style={{ color: darkMode ? "#fff" : "#333" }}>Dark Mode</Text>
        <Switch value={darkMode} onValueChange={() => setDarkMode(!darkMode)} />
      </View>

      <View style={styles.filterContainer}>
        {["all", "completed", "pending"].map((type) => (
          <TouchableOpacity
            key={type}
            style={[
              styles.filterButton,
              filter === type && styles.activeFilter,
            ]}
            onPress={() => setFilter(type)}
          >
            <Text style={styles.filterText}>
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.taskList}>
        {filteredTasks.map((task) => (
          <View
            key={task.id}
            style={[
              styles.task,
              task.completed && styles.completedTask,
              darkMode && styles.taskDark,
            ]}
          >
            {editingId === task.id ? (
              <TextInput
                style={styles.input}
                value={editingText}
                onChangeText={setEditingText}
                onBlur={() => updateTask(task.id)}
                autoFocus
              />
            ) : (
              <Text
                style={[
                  styles.taskText,
                  task.completed && styles.completedText,
                ]}
              >
                {task.title}
              </Text>
            )}

            <View style={styles.actions}>
              <TouchableOpacity
                onPress={() => toggleComplete(task.id)}
                style={[styles.actionButton, styles.greenButton]}
              >
                <Text style={styles.actionText}>
                  ✅ {task.completed ? "Completed" : "Complete"}
                </Text>
              </TouchableOpacity>

              {editingId === task.id ? (
                <TouchableOpacity
                  onPress={() => updateTask(task.id)}
                  style={[styles.actionButton, styles.greenButton]}
                >
                  <Text style={styles.actionText}>💾 Save</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  onPress={() => {
                    setEditingId(task.id);
                    setEditingText(task.title);
                  }}
                  style={[styles.actionButton, styles.blueButton]}
                >
                  <Text style={styles.actionText}>✏️ Edit</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                onPress={() => deleteTask(task.id)}
                style={[styles.actionButton, styles.redButton]}
              >
                <Text style={styles.actionText}>🗑 Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e9f5ec',
    padding: 15,
    paddingTop: 50,
  },
  darkContainer: {
    backgroundColor: '#121212',
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#2d6a4f',
  },
  headerDark: {
    color: '#fff',
  },
  inputContainer: {
    flexDirection: 'row',
    marginBottom: 10,
    gap: 10,
  },
  input: {
    flex: 1,
    borderColor: '#2d6a4f',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  inputDark: {
    backgroundColor: '#333',
    color: '#fff',
    borderColor: '#888',
  },
  addButton: {
    backgroundColor: '#28a745',
    padding: 10,
    borderRadius: 8,
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 20,
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: 15,
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 15,
  },
  filterButton: {
    backgroundColor: '#d2e3db',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  activeFilter: {
    backgroundColor: '#2d6a4f',
  },
  filterText: {
    color: '#000',
  },
  taskList: {
    flex: 1,
  },
  task: {
    backgroundColor: '#80a496',
    padding: 15,
    marginBottom: 10,
    borderRadius: 10,
  },
  taskDark: {
    backgroundColor: '#333',
  },
  taskText: {
    fontSize: 16,
    color: '#fff',
  },
  completedTask: {
    backgroundColor: '#aaa',
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: '#b50000',
  },
  actions: {
    flexDirection: 'row',
    marginTop: 10,
    gap: 10,
  },
  actionText: {
    fontSize: 16,
    color: '#fff',
  },
  actionButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  greenButton: {
    backgroundColor: '#28a745',
  },
  blueButton: {
    backgroundColor: '#007bff',
  },
  redButton: {
    backgroundColor: '#dc3545',
  },
});
