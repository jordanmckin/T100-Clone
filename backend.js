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
    "ACC",
    "BAK",
    "NIL",
    "LEFT",
    "RIGHT",
    "UP",
    "DOWN",
    "ANY",
    "LAST"
]);

const node_count = 9;
let graph_connections = null;
const current_nodes = [];

const LEVEL_ONE_NODES = [1, 2, 3, 4, 5, 6, 7, 8, 9];
const LEVEL_ONE_CONNECTIONS = [
    [1, 2],
    [1, 4],
    [1, 11], //INPUT_PORT
    [2, 1],
    [2, 3],
    [2, 5],
    [2, 22], //INPUT_PORT
    [3, 2],
    [3, 6],
    [3, 33], //INPUT_PORT
    [4, 1],
    [4, 7],
    [4, 5],
    [5, 2],
    [5, 4],
    [5, 6],
    [5, 8],
    [6, 3],
    [6, 5],
    [6, 9],
    [7, 4],
    [7, 8],
    [7, 111], //OUTPUT PORT
    [8, 5],
    [8, 7],
    [8, 9],
    [8, 222], //OUTPUT PORT
    [9, 6],
    [9, 8],
    [9, 333] //OUTPUT PORT
];




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

function find_instruction(node_name) {
    const in_node = current_nodes.find(({
        name
    }) => name === node_name);

    let ln;


    //change the color back to default for our current line
    clear_instruction_colors(in_node.name);

    in_node.current_instruction_line = in_node.current_instruction_line + 1;

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

function isNumber(word) {
    return !isNaN(word);
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
    } else {
        r.push("NULL");
        r.push(word);
        return r;
    }
}

function process_instruction(node_name, inst) {

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
    }

    return null;
}

//make a function that runs all the nodes
function btn_step() {
    for (let i = 0; i < current_nodes.length; i++) {
        //READ CURRENT INSTRUCTION
        let cur_instruction = find_instruction(current_nodes[i].name);
        if (cur_instruction[0] != "") {
            process_instruction(current_nodes[i].name, cur_instruction)
        }
    }

    //update the html to reflect new node data:
    update_display();
}

function btn_stop() {
    reset_display();
}