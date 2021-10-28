Vue.component('navbar', {
  template: `
  <nav class="navbar navbar-expand-lg navbar-dark bg-primary">
    <div class="container-fluid">
      <a class="navbar-brand" href="#">HashCast</a>
      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarColor01" aria-controls="navbarColor01" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navbarColor01">
        <ul class="navbar-nav me-auto">
        </ul>
      </div>
    </div>
  </nav>
  `
})

Vue.component('chat-input', {
  data: function() {
    return {
      chatMessage: null,
      sending: false,
    }
  },
  template: `
  <div class="input-group chat-input">
    <input type="text" v-model="chatMessage" class="form-control" @keydown.enter="sendMessage" placeholder="Type a message...">
    <div class="input-group-append">
      <button class="btn btn-outline-secondary" type="button" @click="sendMessage">Send</button>
    </div>
  </div>
  `,
  methods:{
    async sendMessage() {
      if(this.chatMessage.trim() == "")
      {
        return;
      }

      var msg = this.chatMessage;
      this.chatMessage = "";

      await sendMessage(msg);
    }
  }
})

Vue.component('message', {
  props: ["message"],
  template: `
  <div class="message">
    <div class="card border-primary mb-3">
      <div class="card-header">
        <img :src="message.icon" width="32" />
        {{message.user}}
      </div>
      <div class="card-body message-content">
        {{message.data}}
      </div>
    </div>
  </div>
  `
})

Vue.component('messages', {
  props: ["messages"],
  template: `
  <div class="messages">
    <message v-for="m in messages" :key="m.data" :message="m">
    </message>
  </div>
  `
})

//TODO
Vue.component('left-sidebar', {
  template: `
  <div class="left-sidebar">
    hi
  </div>
  `
})

Vue.component('app', {
  props: ["messages"],

  template: `
  <div class="app">
    <navbar></navbar>
    <messages :messages="messages"></messages>
    <chat-input></chat-input>
  </div>
  `
})
