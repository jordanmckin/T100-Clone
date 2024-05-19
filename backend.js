const VALID_INSTRUCTIONS = new Set([
    "#",
    ":",
    "NIL",
    "MOV",
    "NOP",
    "SWP",
    "SAV",
    "ADD",
    "SUB",
    "NEG",
    "JMP",
    "JEZ",
    "JNZ",
    "JGZ",
    "JLZ",
    "JRO",
    "!" //BREAKPOINT
]);
const VALID_DIR = new Set([
    "NIL",
    "LEFT",
    "RIGHT",
    "UP",
    "DOWN",
    "ANY"
]);
const VALID_INTERNAL_DIR = new Set([
    "ACC"
]);

const node_count = 9;
let graph_connections = null;
const current_nodes = [];
let current_connection_port_data = []; //[from, to, direction, data]

const LEVEL_ONE_NODES = [1, 2, 3, 4, 5, 6, 7, 8, 9];
const LEVEL_ONE_CONNECTIONS = [
    [1, 2, 'RIGHT'],
    [1, 4, 'DOWN'],
    [11, 1, 'DOWN'], //INPUT_PORT
    [2, 1, 'LEFT'],
    [2, 3, 'RIGHT'],
    [2, 5, 'DOWN'],
    [22, 2, 'DOWN'], //INPUT_PORT
    [3, 2, 'LEFT'],
    [3, 6, 'DOWN'],
    [33, 3, 'DOWN'], //INPUT_PORT
    [4, 1, 'UP'],
    [4, 7, 'DOWN'],
    [4, 5, 'RIGHT'],
    [5, 2, 'UP'],
    [5, 4, 'LEFT'],
    [5, 6, 'RIGHT'],
    [5, 8, 'DOWN'],
    [6, 3, 'UP'],
    [6, 5, 'LEFT'],
    [6, 9, 'DOWN'],
    [7, 4, 'UP'],
    [7, 8, 'RIGHT'],
    [7, 111, 'DOWN'], //OUTPUT PORT
    [8, 5, 'UP'],
    [8, 7, 'LEFT'],
    [8, 9, 'RIGHT'],
    [8, 222, 'DOWN'], //OUTPUT PORT
    [9, 6, 'UP'],
    [9, 8, 'LEFT'],
    [9, 333, 'DOWN'] //OUTPUT PORT
];

//list containing data waiting at valid connection
//cannot add connection if data is waiting
//instruction is set back


//Adjacency list directed
class Graph {
    constructor() {
        this.adjacencyList = {};
    }

    addVertex(vertex) {
        if (!this.adjacencyList[vertex]) {
            this.adjacencyList[vertex] = [];
        }
    }

    addEdge(vertex1, vertex2) {
        if (!this.adjacencyList[vertex1]) {
            this.addVertex(vertex1);
        }
        if (!this.adjacencyList[vertex2]) {
            this.addVertex(vertex2);
        }
        this.adjacencyList[vertex1].push(vertex2);
    }

    removeEdge(vertex1, vertex2) {
        this.adjacencyList[vertex1] = this.adjacencyList[vertex1].filter(
            v => v !== vertex2
        );
    }

    removeVertex(vertex) {
        while (this.adjacencyList[vertex].length) {
            const adjacentVertex = this.adjacencyList[vertex].pop();
            this.removeEdge(adjacentVertex, vertex);
        }
        delete this.adjacencyList[vertex];
    }

    display() {
        for (let vertex in this.adjacencyList) {
            console.log(vertex + " -> " + this.adjacencyList[vertex].join(", "));
        }
    }
    getEdges(vertex) {
        return this.adjacencyList[vertex] || [];
    }
}

class TNODE {
    constructor(node_id) {
        this.name = node_id;
        this.ACC = 0;
        this.BAK = 0;
        this.LAST = "N/A";
        this.MODE = "IDLE";
        this.IDLE = "0%";
        this.hang_send_state = false;
        this.hang_receive_state = false;
        this.current_instruction_line = -1;
    }
}

function reset_display() {
    for (let i = 0; i < current_nodes.length; i++) {
        current_nodes[i].ACC = 0;
        current_nodes[i].BAK = 0;
        current_nodes[i].current_instruction_line = -1;
        accv = "NODE" + current_nodes[i].name + "_ACC_VALUE";
        document.getElementById(accv).innerHTML = "0";
        bakv = "NODE" + current_nodes[i].name + "_BAK_VALUE";
        document.getElementById(bakv).innerHTML = "0";
    }
    clear_instruction_colors();
}

function update_display() {
    for (let i = 0; i < current_nodes.length; i++) {
        accv = "NODE" + current_nodes[i].name + "_ACC_VALUE";
        document.getElementById(accv).innerHTML = current_nodes[i].ACC;
        bakv = "NODE" + current_nodes[i].name + "_BAK_VALUE";
        document.getElementById(bakv).innerHTML = current_nodes[i].BAK;
    }
}

function clear_instruction_colors(n = -1) {
    if (n == -1) {
        for (let i = 0; i < current_nodes.length; i++) {
            for (let k = 0; k <= 14; k++) {
                const ln = "NODE" + current_nodes[i].name + "_INSTRUCTION" + k + "_CODE_LINE";
                document.getElementById(ln).style.backgroundColor = 'rgb(36, 35, 35)';
            }
        }
    } else {
        for (let k = 0; k <= 14; k++) {
            const ln = "NODE" + n + "_INSTRUCTION" + k + "_CODE_LINE";
            document.getElementById(ln).style.backgroundColor = 'rgb(36, 35, 35)';
        }
    }
}

function clear_instruction_data() {
    for (let i = 0; i < current_nodes.length; i++) {
        for (let k = 0; k <= 14; k++) {
            const ln = "NODE" + current_nodes[i].name + "_INSTRUCTION" + k + "_CODE_LINE";
            document.getElementById(ln).innerText = "";
        }
    }
    clear_instruction_colors();
}

function add_node_connections() {

    graph_connections = new Graph();

    for (let i = 0; i < current_nodes.length; i++) {
        graph_connections.addVertex(i.name);
    }

    LEVEL_ONE_CONNECTIONS.forEach(pair => {
        const [first, second] = pair;
        graph_connections.addEdge(first, second);
    })

}

function create_node_connection_arrows() {
    // alert(graph_connections.getEdges(1));
}

function initalize_nodes() {
    for (let i = 0; i < LEVEL_ONE_NODES.length; i++) {
        let new_node = new TNODE(LEVEL_ONE_NODES[i]);
        current_nodes.push(new_node);
    }
}

function limit_instruction_input_fiels() {
    document.querySelectorAll('.INSTRUCTION_CODE_LINE').forEach(line => {
        line.addEventListener('input', (e) => {
            const text = e.target.innerText;

            // Limit characters to 15
            if (text.length > 15) {
                e.target.innerText = text.substring(0, 15);
                placeCaretAtEnd(e.target);
            }

            // Prevent new lines
            if (text.includes('\n')) {
                e.target.innerText = text.replace(/\n/g, '');
                placeCaretAtEnd(e.target);
            }
        });

        // Prevent pasting multiline text
        line.addEventListener('paste', (e) => {
            e.preventDefault();
            const text = e.clipboardData.getData('text/plain').replace(/\n/g, '').substring(0, 15);
            document.execCommand('insertText', false, text);
        });
    });
}

function start_up() {
    initalize_nodes();
    reset_display();
    add_node_connections();
    create_node_connection_arrows();
    limit_instruction_input_fiels();
}



// Function to place the caret at the end of the contenteditable div
function placeCaretAtEnd(el) {
    el.focus();
    if (typeof window.getSelection != 'undefined' &&
        typeof document.createRange != 'undefined') {
        const range = document.createRange();
        range.selectNodeContents(el);
        range.collapse(false);
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
    }
}


function node_send_hang_state_check(node_name) {
    const in_node = current_nodes.find(({
        name
    }) => name === node_name);

    if (current_connection_port_data.length > 0) {
        for (let i = 0; i < current_connection_port_data.length; i++) {
            const [from, to, direction, ddata] = current_connection_port_data[i];
            if (from == node_name) {
                //still in hang send state
                return true;
            }
        }

    } else {
        //no longer in hang state
        in_node.hang_send_state = false;
        return false;
    }
    in_node.hang_send_state = false;
    return false;
}

function find_instruction(node_name) {
    const in_node = current_nodes.find(({
        name
    }) => name === node_name);

    let ln;

    //change the color back to default for our current line
    clear_instruction_colors(in_node.name);

    if (in_node.hang_receive_state == false) {
        in_node.current_instruction_line = in_node.current_instruction_line + 1;
    }

    let found_instruction = "";
    let found_instruction_line = "";
    let starting_line = in_node.current_instruction_line - 1;

    for (i = 0; i < 15; i++) {
        starting_line = starting_line + 1;
        if (starting_line > 14) {
            starting_line = 0
        }

        ln = "NODE" + in_node.name + "_INSTRUCTION" + starting_line + "_CODE_LINE";
        const line = document.getElementById(ln);
        const text = line.innerText.trim().toUpperCase();
        const words = text.split(/\s+/);
        for (let word of words) {
            //Check first char for breakpoint, comment ! #
            //Check first char for label : 
            if (word[0] == "!") {
                found_instruction = "!";
                found_instruction_line = text;
                //console.log("HAS BREAKPOINT-!", word)
                break;
            } else if (word[0] == "#") {
                found_instruction = "#";
                found_instruction_line = text;
                //console.log("HAS COMMENT - #", word)
                break;
            } else if (word[word.length - 1] == ":") {
                found_instruction = ":";
                found_instruction_line = text;
                //console.log("HAS LABEL-:", word)
                break;
            } else if (VALID_INSTRUCTIONS.has(word)) {
                found_instruction = word;
                found_instruction_line = text;
                //console.log("HAS CODE-", word)
                break;
            }
        }
        if (found_instruction != "") {
            break;
        }
    }

    //set the current instruction line
    in_node.current_instruction_line = starting_line;

    //change the line color
    if (found_instruction != "") {
        ln = "NODE" + in_node.name + "_INSTRUCTION" + starting_line + "_CODE_LINE";
        document.getElementById(ln).style.backgroundColor = 'grey';
    }

    let ff = []
    ff.push(found_instruction);
    ff.push(found_instruction_line);
    return ff;
}

function inst_label() {
    return null;
}

function inst_breakpoint() {
    //WRITE BREAKPOINT PAUSE
    return null;
}

function inst_comment() {
    return null;
}

function inst_nil() {
    return null;
}

function inst_add(node_name, inst) {
    //get the current node
    const in_node = current_nodes.find(({
        name
    }) => name === node_name);

    //get the source
    const src = find_src(inst[1], 1);
    if (src[0] == "NULL") {
        return;
    } else if (src[0] == "NUMBER") {
        in_node.ACC = in_node.ACC + Number(src[1]);
        if (in_node.ACC > 999) {
            in_node.ACC = 999;
        }
        return;
    } else if (src[0] == "DIR") {
        return;
    }
}

function inst_swp(node_name) {
    //get the current node
    const in_node = current_nodes.find(({
        name
    }) => name === node_name);
    //process the instruction
    let bak = in_node.BAK;
    in_node.BAK = in_node.ACC;
    in_node.ACC = bak;
}

function inst_sav(node_name) {
    //get the current node
    const in_node = current_nodes.find(({
        name
    }) => name === node_name);
    //process the current instruction
    in_node.BAK = in_node.ACC;
}

function send_data_to_connection_port(src, dst, ddata) {

    return false;
}

function get_data_to_receive(src, ddirection) {
    let dur;
    let flip_receive;
    let d = null;
    if (ddirection == "LEFT") {
        dur = "RIGHT";
    } else if (ddirection == "RIGHT") {
        dur = "LEFT";
    } else if (ddirection == "UP") {
        dur = "DOWN";
    } else if (ddirection == "DOWN") {
        dur = "UP";
    }
    LEVEL_ONE_CONNECTIONS.forEach(connection => {
        const [from, to, direction] = connection;
        if (from == src && ddirection == direction) {
            flip_receive = [to, from, dur];
        }
    });

    if (current_connection_port_data.length > 0) {
        for (let i = 0; i < current_connection_port_data.length; i++) {
            const [from, to, direction, ddata] = current_connection_port_data[i];
            if (flip_receive[0] == from && flip_receive[1] == to && flip_receive[2] == direction) {
                d = ddata;
                // Remove the found entry
                current_connection_port_data.splice(i, 1);
                return d; // Return the data after removing the entry
            }
        }
    } else {
        d = null;
    }
    return d;
}

function send_data_from_connection_port(node_id, ddirection, ddata) {
    //send the data from this node to the list AND put the node in a HANG STATE
    LEVEL_ONE_CONNECTIONS.forEach(connection => {
        const [from, to, direction] = connection;
        if (from == node_id && ddirection == direction) {

            //push the data to current connection port data
            //put the node in  hang state
            current_connection_port_data.push([node_id, to, ddirection, ddata]);
            const in_node = current_nodes.find(({
                name
            }) => name === node_id);
            in_node.hang_send_state = true;
        }
    });
    return;
}

function inst_mov(node_name, inst) {
    //get the current node
    const in_node = current_nodes.find(({
        name
    }) => name === node_name);


    //get the source
    const src = find_src(inst[1], 1);
    const dst = find_dst(inst[1], 2);


    if (src[0] == "NULL") {
        return;
    } else if (src[0] == "NUMBER") {
        if (dst[0] == "NULL") {
            return;
        } else if (dst[0] == "DIR") {
            //MOV 5 RIGHT
            if (confirm_node_connection(node_name, dst[1])) {
                //confirm that their is data to pickup IF there is no data then hang for data
                //send the data for pickup, check on next iteration if data has been picked up else send again.
                // move the received data that is in D
                send_data_from_connection_port(node_name, dst[1], src[1]);
                in_node.hang_send_state = true;
                return;
            } else {
                //there is no data waiting to be received, put the node in a hang state
                console.log("NOT VALID MOV LOCATION FOR NUMBER");
            }
        }
        else if (dst[0] == "ACC"){
            //MOV 5 ACC
            in_node.ACC = Number(src[1]);
            return;
        }
        return;
    } else if (src[0] == "ACC") {
        return;
    } else if (src[0] == "DIR") {
        if (dst[0] == "NULL") {
            return;
        } else if (dst[0] == "NUMBER") {
            return;
        } else if (dst[0] == "ACC") {
            //MOV LEFT ACC
            if (dst[0] == "NULL") {
                return;
            } else if (confirm_node_connection(node_name, src[1])) {
                let d = get_data_to_receive(node_name, src[1]);
                if (d != null) {
                    in_node.ACC = d;
                    in_node.hang_receive_state = false;
                    return;
                } else {
                    //PUT NODE IN HANG STATE
                    in_node.hang_receive_state = true;
                    return;
                }
            }
            return;
        } else if (dst[0] == "DIR") {
            //MOV LEFT RIGHT
            if (confirm_node_connection(node_name, dst[1]) == true) {
                if (confirm_node_connection(node_name, src[1])) {
                    //confirm that their is data to pickup IF there is no data then hang for data
                    //send the data for pickup, check on next iteration if data has been picked up else send again.
                    let d = get_data_to_receive(node_name, src[1]);
                    if (d != null) {
                        // move the received data that is in D
                        send_data_from_connection_port(node_name, dst[1], d);
                        return;
                    } else {
                        //there is no data waiting to be received, put the node in a hang state
                        in_node.hang_receive_state = true;
                        return;
                    }
                }
            }
        }
        return;
    }
}

function isNumber(word) {
    return !isNaN(word);
}

function confirm_node_connection(node_name, dir) {
    for (const connection of LEVEL_ONE_CONNECTIONS) {
        const [from, to, direction] = connection;
        if (from == node_name && dir == direction) {
            return true;
        }
    };
    return false;
}

function find_src(inst_line, target_word = 1) {
    let r = []
    const words = inst_line.split(/\s+/);
    const word = words[target_word]
    if (isNumber(word)) {
        r.push("NUMBER")
        r.push(word);
        return r;
    }
    //check if valid direction/source/destination
    else if (VALID_DIR.has(word)) {
        r.push("DIR")
        r.push(word);
        return r;
    } else if (VALID_INTERNAL_DIR.has(word)) {
        r.push("ACC")
        r.push(word);
        return r;
    } else {
        r.push("NULL");
        r.push(word);
        return r;
    }
}

function find_dst(inst_line, target_word = 2) {
    let r = []
    const words = inst_line.split(/\s+/);
    if (words.length > 1) {
        const word = words[target_word]
        if (VALID_DIR.has(word)) {
            r.push("DIR")
            r.push(word);
            return r;
        } else if (VALID_INTERNAL_DIR.has(word)) {
            r.push("ACC")
            r.push(word);
            return r;
        } else {
            r.push("NULL");
            r.push(word);
            return r;
        }
    }
    r.push("NULL");
    r.push(word);
    return r;
}

function process_instruction(node_name, inst) {

    //get the current node
    const in_node = current_nodes.find(({
        name
    }) => name === node_name);

    /*
    "#",
    ":", // MAKE LABEL SEARCHER 
    "MOV", SRC DST
    "NOP",  ADD 0
    "SWP", SWAP ACC & BAK VALUES
    "SAV", ACC -> BAK
    "ADD", ADD SRC
    "SUB", SUB SRC
    "NEG", ACC Negative
    "JMP", SRC
    "JEZ", JEZ SRC(LABEL) IF acc = 0
    "JNZ",
    "JGZ",
    "JLZ",
    "JRO",
    "!" //BREAKPOINT  MAKE SEARCHER
    */

    if (inst[0] == "#") {
        inst_comment();
    } else if (inst[0] == ":") {
        inst_label();
    } else if (inst[0] == "!") {
        inst_breakpoint();
    } else if (inst[0] == "SWP") {
        inst_swp(node_name);
    } else if (inst[0] == "SAV") {
        inst_sav(node_name);
    } else if (inst[0] == "ADD") {
        inst_add(node_name, inst);
    } else if (inst[0] == "MOV") {
        inst_mov(node_name, inst);
    }

    return null;
}

//make a function that runs all the nodes
function btn_step() {
    for (let i = 0; i < current_nodes.length; i++) {
        //READ CURRENT INSTRUCTION
        if (node_send_hang_state_check(current_nodes[i].name) == false) {
            let cur_instruction = find_instruction(current_nodes[i].name);
            if (cur_instruction[0] != "") {
                process_instruction(current_nodes[i].name, cur_instruction)
            }
        }
    }

    //update the html to reflect new node data:
    update_display();
}

function btn_stop() {
    reset_display();
}