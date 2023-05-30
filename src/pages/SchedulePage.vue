<template>
  <q-page class="flex flex-center">
    <q-card class="my-card" flat bordered>
      <q-item>

        <q-item-section>
          <q-item-label>Admin</q-item-label>
          <q-item-label caption>
            Scheduler
          </q-item-label>
        </q-item-section>
      </q-item>

      <q-separator />

      <q-card-section>

        <q-card-section class="col-6">
          <div class="flex flex-center q-pb-lg">
            <div class="row">

              <div class="col-12 q-pa-sm">
                <q-input filled v-model="eventForm.title" label="Title" readonly />
              </div>

              <div class="col-12 q-pa-sm">
                <q-input type="textarea" filled v-model="eventForm.desc" label="Description" readonly />
              </div>

              <div class="col-12 col-sm-6 q-pa-sm">
                <q-input filled v-model="eventForm.date" mask="date" :rules="['date']">
                  <template v-slot:append>
                    <q-icon name="event" class="cursor-pointer">
                      <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                        <q-date v-model="eventForm.date" :options="available_date">
                          <div class="row items-center justify-end">
                            <q-btn v-close-popup label="Close" color="primary" flat />
                          </div>
                        </q-date>
                      </q-popup-proxy>
                    </q-icon>
                  </template>
                </q-input>
              </div>

              <div class="col-12 col-sm-6 q-pa-sm">
                <q-input filled v-model="eventForm.time" mask="time" :rules="['time']">
                  <template v-slot:append>
                    <q-icon name="access_time" class="cursor-pointer">
                      <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                        <q-time v-model="eventForm.time" :hour-options="available_hour" :minute-options="[0, 30]">
                          <div class="row items-center justify-end">
                            <q-btn v-close-popup label="Close" color="primary" flat />
                          </div>
                        </q-time>
                      </q-popup-proxy>
                    </q-icon>
                  </template>
                </q-input>
              </div>

            </div>

          </div>
          <div class="col-12 q-pa-sm">
            <q-btn @click="scheduleEvent()" color="primary" label="Update" />
          </div>
        </q-card-section>

      </q-card-section>
    </q-card>
  </q-page>
</template>

<script>
import { defineComponent } from 'vue'
import { date } from 'quasar'
import { app, auth, db } from 'boot/firebase'
import { doc, getDoc, setDoc } from "firebase/firestore";
import axios from 'axios';

export default defineComponent({
  name: 'SchedulePage',
  props: ["user"],
  data() {
    return {
      eventForm: {
        id: null,
        event_id: null,
        title: '',
        desc: '',
        date: '',
        time: '',
      },
      available: {
        week: [],
        str_time: '',
        end_time: '',
        event_by: ''
      },
    }
  },
  computed: {
    available_date() {
      if (Object.keys(this.available.week).length == 0) {
        return [];
      }
      let arr = [];
      let init_date = new Date();
      let count = 0;
      while (count < 4) {
        init_date.setDate(init_date.getDate() + 1);
        let day_name = init_date.toLocaleDateString("en-US", { weekday: 'long' });
        let day_available = Object.keys(this.available.week).filter((v) => this.available.week[v] == true && v == day_name)
        if (day_available.length > 0) {
          arr.push(date.formatDate(init_date, 'YYYY/MM/DD'));
          count++;
        }
      }
      return arr;
    },
    available_hour() {
      let arr = [];
      for (let i = this.available.str_time.split(":")[0]; i < this.available.end_time.split(":")[0]; i++) {
        arr.push(i)
      }
      return arr;
    }
  },
  mounted() {
    this.getEvent()
  },
  methods: {
    async getEvent() {
      const docRef = doc(db, "events", this.$route.params.id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        let docData = docSnap.data();
        this.eventForm = {
          event_id: docSnap.id,
          title: docData.title,
          desc: docData.desc,
        };
        this.available.week = docData.weekselected
        this.available.str_time = docData.str_time
        this.available.end_time = docData.end_time
        this.available.event_by = docData.event_by
      }
    },
    async scheduleEvent() {
      await setDoc(doc(db, "schedule_event", `${this.eventForm.event_id}_${this.user.uid}`), {
        title: this.eventForm.title,
        desc: this.eventForm.desc,
        date: this.eventForm.date,
        time: this.eventForm.time,
        event_by: this.available.event_by,
        schedule_by: this.user.uid,
      });
    }
  }
})
</script>
