function messageHandler(event) {
    
    var messageSent = event.data;
	postMessage('test1');

}

// On d�finit la fonction � appeler lorsque la page principale nous sollicite
this.addEventListener('message', messageHandler, false);