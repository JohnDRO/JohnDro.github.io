function messageHandler(event) {
    
    var messageSent = event.data;
	
	switch (messageSent.cmd) {
		case 'parse_json':
		  
		  postMessage(ParseJson(messageSent.data););
		  break;
	}
	
	// postMessage('test1');

}

// On définit la fonction à appeler lorsque la page principale nous sollicite
this.addEventListener('message', messageHandler, false);

function ParseJson(json) {
	var Components = new Array();
	var Connections = new Array();
	var Connections_tmp = new Array();
	
	var Circuit_Name = '';
	var Nbr_Cste = 0;
	
	// Init des variables
	// 1. Boucle à travers les compo pour les retirer (soit faire une fct soit mettre dans le code, à voir)
	Components[0] = 0;
	Connections[0] = 0;
	Connections_tmp[0] = 0;
	// --
	
	// boucle JSON Parsing
	Circuit_Name = Object.keys(json.modules);
	
	// read I/O (A, B, clk, reset, ..)
	io_names = Object.keys(json.modules[Circuit_Name].ports);
	
	// Inputs and Outputs
	for (i in io_names) {
		// I increase the number of componants and create a new array.
		Components[0]++;
		Components[Components[0]] = new Array();
		
		Components[Components[0]][0] = io_names[i]; // label name of the input/output
		Components[Components[0]][1] = false; // hide name : you can't hide the name of an input/output (only cells can)
		
		Components[Components[0]][2] = (json.modules[Circuit_Name].ports[io_names[i]].direction === 'input') ? 0 : 1; // gate type : 0 means input and 1 means output
		
		// Parameters and attributes
		Components[Components[0]][3] = new Array();
		Components[Components[0]][4] = new Array();
		
		Components[Components[0]][3][0] = 0; // inputs/outputs have no no parameters (only cells have)
		Components[Components[0]][4][0] = 0; // inputs/outputs have no no attributes (only cells have)
		// --
		
		Components[Components[0]][6] = ''; // svg element
		Components[Components[0]][7] = false; // reverse
		
		// Connections related
		index = json.modules[Circuit_Name].ports[io_names[i]].bits;
		
		if (index.length > 1) // We check if this port is a single wire or a bus.
			Components[Components[0]][0] += ' [' + (index.length - 1) + ':0]'; // If this is a bus, we add the size in the label.
		
		// I fill port informations
		Components[Components[0]][5] = new Array();
		Components[Components[0]][5][0] = 1; // Since this is an input or an output, it has only one port.
		
		Components[Components[0]][5][1] = new Array();
		
		Components[Components[0]][5][1][0] = Components[Components[0]][0];
		Components[Components[0]][5][1][1] = index.length;
		Components[Components[0]][5][1][2] = Components[Components[0]][2];
		// --
		
		var constant = 0;
		var const_value = '';
		//  = '';
		//
		
		
		for (a = 0; a < index.length; a++) {
			if (typeof index[a] == 'string') {
				constant = 1;
				const_value += index[a];
			}
			
			else {
				const_value += 'X';	
				
				// Code related to the connections var	
				if (typeof Connections[index[a]] == 'undefined') { // First element : the array doesn't exist
					Connections[index[a]] = new Array();
					
					Connections[0]++;
					
					Connections[index[a]][0] = 1; // One element.
					Connections[index[a]][1] = ''; // svg element
					Connections[index[a]][2] = [Components[0], Components[Components[0]][0], a]; // [Id of the element, Name of the port, Net position]
				}
				
				else { // Not the first element : the array already exist
					Connections[index[a]][0]++;
						
					Connections[index[a]][Connections[index[a]][0] + 2] = [Components[0], Components[Components[0]][0], a]; // [Id of the element, Name of the port, Net position]
				}
			}
		}
		
		if (constant) {
			Components[0]++;
			Components[Components[0]] = new Array();
			
			Components[Components[0]][0] = const_value; // usually it is the label of the component, here it is the value of the constant
			Components[Components[0]][1] = false; // hide name : you can't hide the name of an constant (only cells can)
			
			Components[Components[0]][2] = 0; // Constants are like input
			
			// Parameters and attributes
			Components[Components[0]][3] = new Array();
			Components[Components[0]][4] = new Array();
			
			Components[Components[0]][3][0] = 0; // inputs/outputs have no no parameters (only cells have)
			Components[Components[0]][4][0] = 0; // inputs/outputs have no no attributes (only cells have)
			// --
			
			Components[Components[0]][6] = ''; // svg element
			Components[Components[0]][7] = false; // reverse
			
			Nbr_Cste++;
			
			// Connections_tmp
			Connections_tmp[0]++;
			Connections_tmp[Connections_tmp[0]] = new Array();
			
			Connections_tmp[Connections_tmp[0]][0] = [Components[0] - 1, Components[Components[0] - 1][0], 0]; // The Input/Output
			Connections_tmp[Connections_tmp[0]][1] = [Components[0], const_value, 0]; // The constant
			// --
		}
	}
	// --
	
	// Cells
	// read cells (NOT, AND, OR, ..)
	cells_name = Object.keys(json.modules[Circuit_Name].cells);
	
	var CompoValue = 0;
	
	for (n in cells_name) {
		// I increase the number of componants and create a new array.
		Components[0]++;
		Components[Components[0]] = new Array();
		
		CompoValue = Components[0]
		
		Components[Components[0]][0] = cells_name[n]; // label
		Components[Components[0]][1] = json.modules[Circuit_Name].cells[cells_name[n]].hide_name; // hide name
		Components[Components[0]][2] = GateToEqNumber(json.modules[Circuit_Name].cells[cells_name[n]].type); // gate type

		// Parameters and attributes
		Components[Components[0]][3] = new Array();
		Components[Components[0]][4] = new Array();
		
		Components[Components[0]][3][0] = 0; // init the number of parameters to 0.
		Components[Components[0]][4][0] = 0; // init the number of attributes to 0.
		
		// I check parameters
		param_names = Object.keys(json.modules[Circuit_Name].cells[cells_name[n]].parameters);
		
		for (k in param_names) {
			Components[Components[0]][3][0]++;
			
			index = Components[Components[0]][3][0];
			
			Components[Components[0]][3][index] = new Array();

			Components[Components[0]][3][index][0] = param_names[k]; // name of the parameter
			Components[Components[0]][3][index][1] = json.modules[Circuit_Name].cells[cells_name[n]].parameters[param_names[k]]; // value of the parameter
		}
		// --
		
		// I check attributes
		attrib_names = Object.keys(json.modules[Circuit_Name].cells[cells_name[n]].attributes);
		
		for (l in attrib_names) {
			Components[Components[0]][4][0]++;
			
			index = Components[Components[0]][4][0];
			
			Components[Components[0]][4][index] = new Array();

			Components[Components[0]][4][index][0] = attrib_names[l]; // name of the parameter
			Components[Components[0]][4][index][1] = json.modules[Circuit_Name].cells[cells_name[n]].attributes[attrib_names[l]]; // value of the parameter
		}
		// --
		
		Components[Components[0]][6] = ''; // svg element
		Components[Components[0]][7] = false; // reverse
		
		// Connections related
		cell_io_name = Object.keys(json.modules[Circuit_Name].cells[cells_name[n]].connections);
		Components[Components[0]][5] = new Array();
		Components[Components[0]][5][0] = 0;
		
		for (j in cell_io_name) {
			Components[CompoValue][5][0]++;
			index = Components[CompoValue][5][0];
			
			Components[CompoValue][5][index] = new Array();
			
			Components[CompoValue][5][index][0] = cell_io_name[j];
			Components[CompoValue][5][index][1] = json.modules[Circuit_Name].cells[cells_name[n]].connections[cell_io_name[j]].length;
			Components[CompoValue][5][index][2] = GetPortType(Components[CompoValue][2], cell_io_name[j]);
		
			index = json.modules[Circuit_Name].cells[cells_name[n]].connections[cell_io_name[j]];
			
			constant = 0;
			const_value = '';
			
			for (a = 0; a < index.length; a++) {
				if (typeof index[a] == 'string') {
					constant = 1;
					const_value += index[a];	
					
					// .. ici j'ajoute le code pour le code avec les cst 
				}
				
				else {
					const_value += 'X';
					
					// Code related to the connections var	
					if (typeof Connections[index[a]] == 'undefined') { // First element : the array doesn't exist
						Connections[index[a]] = new Array();
						
						Connections[0]++;
						
						Connections[index[a]][0] = 1; // One element.
						Connections[index[a]][1] = ''; // svg element
						Connections[index[a]][2] = [Components[0], Components [Components[0]][0], a]; // [Id of the element, Name of the port, Net position]
					}
					
					else { // Not the first element : the array already exist
						Connections[index[a]][0]++;
							
						Connections[index[a]][Connections[index[a]][0] + 2] = [Components[0], Components[Components[0]][0], a]; // [Id of the element, Name of the port, Net position]
					}
				}
			}
			
			if (constant) {
				Components[0]++;
				Components[Components[0]] = new Array();
				
				Components[Components[0]][0] = const_value; // usually it is the label of the component, here it is the value of the constant
				Components[Components[0]][1] = false; // hide name : you can't hide the name of an constant (only cells can)
				
				Components[Components[0]][2] = 0; // Constants are like input
				
				// Parameters and attributes
				Components[Components[0]][3] = new Array();
				Components[Components[0]][4] = new Array();
				
				Components[Components[0]][3][0] = 0; // inputs/outputs have no no parameters (only cells have)
				Components[Components[0]][4][0] = 0; // inputs/outputs have no no attributes (only cells have)
				// --
				
				Components[Components[0]][6] = ''; // svg element
				Components[Components[0]][7] = false; // reverse
				Nbr_Cste++;
				
				// Connections_tmp
				Connections_tmp[0]++;
				Connections_tmp[Connections_tmp[0]] = new Array();
				
				Connections_tmp[Connections_tmp[0]][0] = [CompoValue, cell_io_name[j], 0]; // The Input/Output
				Connections_tmp[Connections_tmp[0]][1] = [Components[0], const_value, 0]; // The constant
				// --
			}

		}
	}
	
	// I move Connections_tmp into Connections
	for (a = 1; a <= Connections_tmp[0]; a++) {
		Connections[0]++;
		
		Connections[Connections[0]] = new Array();
		Connections[Connections[0]][0] = 2;
		Connections[Connections[0]][1] = '';
		
		Connections[Connections[0]][2] = [Connections_tmp[Connections_tmp[0]][0][0], Connections_tmp[Connections_tmp[0]][0][1], Connections_tmp[Connections_tmp[0]][0][2]];
		Connections[Connections[0]][3] = [Connections_tmp[Connections_tmp[0]][1][0], Connections_tmp[Connections_tmp[0]][1][1], Connections_tmp[Connections_tmp[0]][1][2]];
	}
	// --
	
	return Components[1][0];
}

function GateToEqNumber(GateString) { // Gate to equivalent number. ex : input : '$_NOT_', output : 3
	var GateNumber = -1; // -1 is undefined here
	
	switch (GateString) {
		case '$_NOT_':
			GateNumber = 3;
		break;
		case '$_AND_':
			GateNumber = 4;
		break;
		case '$_OR_':
			GateNumber = 5;
		break;
		case '$_XOR_':
			GateNumber = 6;
		break;
		case '$_DFF_P_':
			GateNumber = 7;
		break;
		case '$_MUX_':
			GateNumber = 8;
		break;
		case '$_DFF_N_':
			GateNumber = 9;
		break;
		case '$_DFF_NN0_':
			GateNumber = 10;
		break;
		case '$_DFF_NN1_':
			GateNumber = 10;
		break;
		case '$_DFF_NP0_':
			GateNumber = 11;
		break;
		case '$_DFF_NP1_':
			GateNumber = 11;
		break;
		case '$_DFF_PN0_':
			GateNumber = 12;
		break;
		case '$_DFF_PN1_':
			GateNumber = 12;
		break;
		case '$_DFF_PP0_':
			GateNumber = 13;
		break;
		case '$_DFF_PP1_':
			GateNumber = 13;
		break;
		/*
		case '$_DLATCH_P_':
			GateNumber = 9;
		break;
		*/
	}
	
	return GateNumber;
}

function GetPortType (Gate_Type, Connection_Name) {
	switch(Gate_Type) { // return 0 for an recepter and 1 for an emetter
		case 0:
			return 1;
		break;
		case 1:
			return 0;
		break;
		case 2:
			if(Connection_Name == 'A')
				return 0;
			else
				return 1;
		break;
		case 3:
			if(Connection_Name == 'A')
				return 0;
			else
				return 1;
		break;
		case 4:
			if(Connection_Name == 'A' || Connection_Name == 'B')
				return 0;
			else
				return 1;
		break;
		case 5:
			if(Connection_Name == 'A' || Connection_Name == 'B')
				return 0;
			else
				return 1;
		break;
		case 6:
			if(Connection_Name == 'A' || Connection_Name == 'B')
				return 0;
			else
				return 1;
		break;
		/* todo: finish other components
		case 7:
			return 1;
		break;
		case 8:
			return 1;
		break;
		case 9:
			return 1;
		break;
		case 10:
			return 1;
		break;
		case 11:
			return 1;
		break;
		case 12:
			return 1;
		break;
		case 13:
			return 1;
		break;
		*/
		default: // Error
			return 0;
		break;
	}
}
// --	