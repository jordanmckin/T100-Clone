//special search for label, <>, ! & comments

const valid_instructions = new Set(
    "!",
    "#",
    ":",
    "<>",
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
);
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
    getEdges(vertex){
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
    }
}

function reset_display() {
    for (let i = 0; i < current_nodes.length; i++) {
        accv = "NODE" + current_nodes[i].name + "_ACC_VALUE";
        document.getElementById(accv).innerHTML = "0";
        bakv = "NODE" + current_nodes[i].name + "_BAK_VALUE";
        document.getElementById(bakv).innerHTML = "0";
        insv = "instruction_input" + current_nodes[i].name;
        document.getElementById(insv).value = "#EMPTY";
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

function start_up() {
    initalize_nodes();
    reset_display();
    add_node_connections();
    create_node_connection_arrows();
}

//make PORT connections that are LEVEL specific


//make a function that runs all the nodes
function step_function() {
    for (let i = 1; i < node_count; i++) {
        let a = "_ACC_VALUE";
        let b = "NODE";
        let c = b + i + a;

        let node = document.getElementById(c);
        node.innerHTML = 5;
    }
}