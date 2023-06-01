<template>
  <q-page class="flex flex-center">
    <q-card class="my-card" flat bordered v-if="user.uid">
      <q-item>

        <q-item-section>
          <q-item-label>Admin</q-item-label>
          <q-item-label caption>
            Scheduler
          </q-item-label>
        </q-item-section>
      </q-item>

      <q-separator />

      <q-card-section horizontal>

        <q-card-section class="col-6">
          <div class="flex flex-center q-pb-lg">
            <div class="row">

              <div class="col-12 q-pa-sm">
                <q-input filled v-model="eventForm.title" label="Title" />
              </div>

              <div class="col-12 q-pa-sm">
                <q-input type="textarea" filled v-model="eventForm.desc" label="Description" />
              </div>

              <div class="col-12 col-sm-6 q-pa-sm">
                <q-input filled v-model="eventForm.str_time" mask="time" :rules="['time']">
                  <template v-slot:append>
                    <q-icon name="access_time" class="cursor-pointer">
                      <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                        <q-time v-model="eventForm.str_time"
                          :minute-options="[0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55]">
                          <div class="row items-center justify-end">
                            <q-btn v-close-popup label="Close" color="primary" flat />
                          </div>
                        </q-time>
                      </q-popup-proxy>
                    </q-icon>
                  </template>
                </q-input>
              </div>
              <div class="col-12 col-sm-6 q-pa-sm">

                <q-input filled v-model="eventForm.end_time" mask="time" :rules="['time']">
                  <template v-slot:append>
                    <q-icon name="access_time" class="cursor-pointer">
                      <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                        <q-time v-model="eventForm.end_time" :hour-options="endHourOption"
                          :minute-options="[0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55]">
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
          <div>
            <q-checkbox v-for="(wv, wk) in weekopt" :key="wk" v-model="eventForm.weekselected[wv]" :label="wv"
              color="red" />
          </div>
          <div class="col-12 q-pa-sm">
            <q-btn @click="updateEvent()" color="primary" label="Update" />
          </div>
        </q-card-section>

        <q-separator vertical />

        <q-card-section class="col-4">

          <q-table class="full-width" flat bordered :rows="event_tbl_data" :columns="event_tbl_col" row-key="id"
            v-model:selected="event_tbl_select">

            <template v-slot:top-right>
              <q-btn @click="addNew()" color="primary" label="New" />
            </template>

            <template v-slot:header="props">
              <q-tr :props="props" class="bg-table-header">
                <q-th v-for="col in props.cols" :key="col.name" :props="props">
                  {{ col.label }}
                </q-th>
              </q-tr>
            </template>
            <template v-slot:body="props">
              <q-tr class="" :props="props">
                <q-td key="title" :props="props">
                  {{ props.row.title }}
                </q-td>
                <q-td key="id" :props="props">
                  <q-btn flat round color="primary" size="sm" @click="editRow(props.row)" icon="edit" />
                  <q-btn flat round color="primary" size="sm" icon="delete" />
                </q-td>
              </q-tr>
            </template>
          </q-table>

        </q-card-section>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script>
import { defineComponent } from 'vue'
import { app, auth, db } from 'boot/firebase'
import { collection, query, where, setDoc, doc, getDocs, addDoc } from "firebase/firestore";

export default defineComponent({
  name: 'AdminPage',
  props: ["user"],
  data() {
    return {
      weekopt: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      eventForm: {
        id: null,
        title: "",
        desc: "",
        str_time: '',
        end_time: '',
        weekselected: {
          "Sunday": false,
          "Monday": false,
          "Tuesday": false,
          "Wednesday": false,
          "Thursday": false,
          "Friday": false,
          "Saturday": false
        },
      },
      event_tbl_select: [],
      event_tbl_col: [
        { name: 'title', label: 'Title', field: 'title', sortable: true },
        { name: 'id', label: 'Action', field: 'id' }
      ],
      event_tbl_data: [],
    }
  },
  computed: {
    endHourOption() {
      let str_hour = parseInt(this.str_time.split(":")[0]) + 1;
      let hoursarr = Array.from({ length: 25 - str_hour }, (_, a) => a + str_hour);
      return hoursarr;
    }
  },
  mounted() {
    this.getEvent()
  },
  methods: {
    addNew() {
      this.eventForm = {
        id: null,
        title: "",
        desc: "",
        str_time: '',
        end_time: '',
        weekselected: {
          "Sunday": false,
          "Monday": false,
          "Tuesday": false,
          "Wednesday": false,
          "Thursday": false,
          "Friday": false,
          "Saturday": false
        },
      }
    },
    editRow(data) {
      this.eventForm.id = data.id;
      this.eventForm.title = data.title;
      this.eventForm.desc = data.desc;
      this.eventForm.str_time = data.str_time;
      this.eventForm.end_time = data.end_time;
      this.eventForm.weekselected = data.weekselected;
      this.eventForm.event_by = data.event_by;
    },
    async updateEvent() {
      if (this.eventForm.id) {
        await setDoc(doc(db, "events", this.eventForm.id), {
          title: this.eventForm.title,
          desc: this.eventForm.desc,
          str_time: this.eventForm.str_time,
          end_time: this.eventForm.end_time,
          weekselected: this.eventForm.weekselected,
          event_by: this.user.uid
        });
      } else {
        const docRef = await addDoc(collection(db, "events"), {
          title: this.eventForm.title,
          desc: this.eventForm.desc,
          str_time: this.eventForm.str_time,
          end_time: this.eventForm.end_time,
          weekselected: this.eventForm.weekselected,
          event_by: this.user.uid
        });
      }
      this.getEvent();

    },
    async getEvent() {
      const q = query(collection(db, "events"), where("event_by", "==", this.user.uid));
      const querySnapshot = await getDocs(q);
      this.event_tbl_data = [];
      querySnapshot.forEach((doc) => {
        let users = doc.data();
        users['id'] = doc.id;
        this.event_tbl_data.push(users)
      });
    }
  }
})
</script>
