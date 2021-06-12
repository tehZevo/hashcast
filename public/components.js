Vue.component('navbar', {
  template: `
  <nav class="navbar navbar-expand-lg navbar-dark bg-primary">
    <div class="container-fluid">
      <a class="navbar-brand" href="#">Navbar</a>
      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarColor01" aria-controls="navbarColor01" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>

      <div class="collapse navbar-collapse" id="navbarColor01">
        <ul class="navbar-nav me-auto">
          <li class="nav-item">
            <a class="nav-link active" href="#">Home
              <span class="visually-hidden">(current)</span>
            </a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="#">Features</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="#">Pricing</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="#">About</a>
          </li>
          <li class="nav-item dropdown">
            <a class="nav-link dropdown-toggle" data-bs-toggle="dropdown" href="#" role="button" aria-haspopup="true" aria-expanded="false">Dropdown</a>
            <div class="dropdown-menu">
              <a class="dropdown-item" href="#">Action</a>
              <a class="dropdown-item" href="#">Another action</a>
              <a class="dropdown-item" href="#">Something else here</a>
              <div class="dropdown-divider"></div>
              <a class="dropdown-item" href="#">Separated link</a>
            </div>
          </li>
        </ul>
        <form class="d-flex">
          <input class="form-control me-sm-2" type="text" placeholder="Search">
          <button class="btn btn-secondary my-2 my-sm-0" type="submit">Search</button>
        </form>
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
    <input type="text" :disabled="sending" v-model="chatMessage" class="form-control" @keydown.enter="sendMessage" placeholder="Type a message...">
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

      this.sending = true;
      var msg = this.chatMessage;
      this.chatMessage = "";

      await sendMessage(msg);
      this.sending = false;
    }
  }
})

Vue.component('message', {
  props: ["message"],
  template: `
  <div class="message">
    <div class="card border-primary mb-3">
      <div class="card-header">{{message.user}}</div>
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
