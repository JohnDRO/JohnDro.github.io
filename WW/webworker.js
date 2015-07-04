function messageHandler(event) {
    
    var messageSent = event.data;
	postMessage('test1');

}

// On définit la fonction à appeler lorsque la page principale nous sollicite
this.addEventListener('message', messageHandler, false);