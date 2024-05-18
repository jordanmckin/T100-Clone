//special search for label, <>, ! & comments 
const VALID_INSTRUCTIONS = new Set([
    "#",
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
    "JRO"
]);
const node_count = 9;
let graph_connections = null;
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
const current_nodes = [];



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
        accv = "NODE" + current_nodes[i].name + "_ACC_VALUE";
        document.getElementById(accv).innerHTML = "0";
        bakv = "NODE" + current_nodes[i].name + "_BAK_VALUE";
        document.getElementById(bakv).innerHTML = "0";
        current_nodes[i].current_instruction_line = -1;
    }
    clear_instruction_colors();
}

function clear_instruction_colors(n = -1) {
    if (n == -1) {
        for (let i = 0; i < current_nodes.length; i++) {
            for (let k = 0; k < 14; k++) {
                const ln = "NODE" + current_nodes[i].name + "_INSTRUCTION" + k + "_CODE_LINE";
                document.getElementById(ln).style.backgroundColor= 'rgb(36, 35, 35)';
            }
        }
    } else {
        for (let k = 0; k < 14; k++) {
            const ln = "NODE" + n + "_INSTRUCTION" + k + "_CODE_LINE";
            document.getElementById(ln).style.backgroundColor = 'rgb(36, 35, 35)';
        }
    }
}

function clear_instruction_data() {
    for (let i = 0; i < current_nodes.length; i++) {
        for (let k = 0; k < 14; k++) {
            const ln = "NODE" + current_nodes[i].name + "_INSTRUCTION" + k + "_CODE_LINE";
            document.getElementById(ln).innerText = "";
        }
    }
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
            if (VALID_INSTRUCTIONS.has(word)) {
                found_instruction = word;
                console.log("HAS CODE-", word)
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


    return found_instruction;
}

function process_instruction(node_name, inst) {

}

//make a function that runs all the nodes
function btn_step() {
    for (let i = 0; i < current_nodes.length; i++) {
        //READ CURRENT INSTRUCTION
        let cur_instruction = find_instruction(current_nodes[i].name);
        if (cur_instruction != "") {
            process_instruction(cur_instruction[i].name, cur_instruction)
        }
    }
}

function btn_stop() {
    reset_display();
}