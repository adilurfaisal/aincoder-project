<template>
  <q-layout view="hHh lpR fFf">

    <q-header elevated class="bg-red text-white">
      <q-toolbar>
        <q-toolbar-title>
          <q-avatar>
            <img src="~assets/scheduler.svg">
          </q-avatar>
          AINCODER SCHEDULER
        </q-toolbar-title>
        <q-space />
        <div v-if="user.uid">
          {{ user.displayName }}
          <q-btn round flat icon="logout" @click="logout()" />
        </div>
        <q-btn v-else flat icon="login" label="Signin" @click="login()" />

      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view v-if="user.uid" :user="user" />
    </q-page-container>

  </q-layout>
</template>
<script>
import { defineComponent } from 'vue'
import { api } from 'boot/axios'
import { signOut, onAuthStateChanged, signInWithRedirect, getRedirectResult, GoogleAuthProvider } from "firebase/auth";
import { app, auth, db } from 'boot/firebase'
import { doc, setDoc } from "firebase/firestore";

const provider = new GoogleAuthProvider();

export default defineComponent({
  name: 'IndexPage',
  data() {
    return {
      user: {}
    }
  },
  mounted() {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        this.user = user;
        await setDoc(doc(db, "users", user.uid), {
          name: user.displayName,
          email: user.email,
          admin: true
        });
      }
    });
  },
  methods: {
    login() {
      signInWithRedirect(auth, provider);
    },
    logout() {
      signOut(auth).then(() => {
        this.user = {};
        console.log("Sign-out successful")
      }).catch((error) => {
        console.log(error)
      });
    }
  }
})
</script>
