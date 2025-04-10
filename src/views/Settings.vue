<template>
  <div class="settings-page">
    <h1>Settings</h1>
    <form @submit.prevent="updateSettings">
      <label>
        Name:
        <input type="text" v-model="user.username" />
      </label>
      <label>
        Email:
        <input type="email" v-model="user.email" />
      </label>
      <button type="submit">Update Settings</button>
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { getAuth, updateProfile, updateEmail } from 'firebase/auth';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '@/firebase'; // Assuming your Firestore instance is imported like this

// Initialize the user object to hold form data
const user = ref({
  username: '',
  email: ''
});

// Fetch the current user's info onMounted
onMounted(() => {
  const currentUser = getAuth().currentUser;
  if (currentUser) {
    // Get user data and set it to form fields
    user.value.username = currentUser.displayName || '';
    user.value.email = currentUser.email || '';
  }
});

// Handle updating the user settings
const updateSettings = async () => {
  const currentUser = getAuth().currentUser;
  if (currentUser) {
    try {
      // Update Firebase Authentication details (username/displayName and email)
      await updateProfile(currentUser, { displayName: user.value.username });

      if (user.value.email !== currentUser.email) {
        await updateEmail(currentUser, user.value.email); // Update email if it was changed
      }

      // Optionally, update Firestore user data (if stored there)
      const userRef = doc(db, 'users', currentUser.uid);
      const docSnap = await getDoc(userRef);
      if (docSnap.exists()) {
        await updateDoc(userRef, {
          username: user.value.username,
          email: user.value.email // Update Firestore with the new email if it's different
        });
      }

      alert('Settings updated successfully!');
    } catch (error) {
      console.error('Error updating user info:', error);
      alert('There was an error updating your settings. Please try again later.');
    }
  } else {
    alert('No user is logged in.');
  }
};
</script>

<style scoped>
.settings-page {
  padding: 20px;
}

form {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

label {
  margin-bottom: 10px;
}

button {
  margin-top: 20px;
  padding: 10px;
  background-color: #007bff;
  color: white;
  border: none;
  cursor: pointer;
}

button:hover {
  background-color: #0056b3;
}
</style>
