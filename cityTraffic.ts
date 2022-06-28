export class AppComponent {
    name = '';
    ngOnInit(): void {
        let A: Array<string> = [
            `1:[5]`,
            `4:[5]`,
            `3:[5]`,
            `5:[1,4,3,2]`,
            `2:[5,15,7]`,
            `7:[2,8]`,
            `8:[7,38]`,
            `15:[2]`,
            `38:[8]`,
        ];
        console.log(`A ` + A);
        let B: Array<string> = [`1:[5]`, `2:[5]`, `3:[5]`, `4:[5]`, `5:[1,2,3,4]`];
        //Console.WriteLine("B " + string.Join(',', B));
        let C: Array<string> = [
            `1:[5]`,
            `2:[5,18]`,
            `3:[5,12]`,
            `4:[5]`,
            `5:[1,2,3,4]`,
            `18:[2]`,
            `12:[3]`,
        ];
        console.log(`${`A ` + Graph.CityTraffic(A, A.length)}\n`);
        console.log(`${`B ` + Graph.CityTraffic(B, B.length)}\n`);
    }
}
export class Graph {
    /*
        Our first steps will be to set up the graph
        One approach we can use is to check every city
        Once we arrive at a current city we now check its neighbors, the number of neighbors determine the possible numbers of incoming traffic. Example if a city has 2 neighbors, than is there will be 2 incoming traffics into that city. 
        We can perform a BFS from each neighbor start point and get a total of the population.
        We store the population of each incoming traffic and record only the maximum possible traffic for that city. 
        */
    // hash map to quickly index the vertices
    public static nodeIndex: Map<number, number> = new Map<number, number>();
    // method to  create a connection between 2 nodes
    public static makePairs(
        graph: Array<Array<Node>>,
        source: number,
        partner: number
    ): void {
        // making the edge connection
        graph[+Graph.nodeIndex.get(source) as number].push(
            graph[+Graph.nodeIndex.get(partner) as number][+0]
        );
    }
    // method to create our graph
    public static createGraph(
        graph: Array<Array<Node>>,
        arr: Array<string>,
        size: number
    ): void {
        // traverse the string array to first extract the cost of each node
        for (let x: number = 0; x < size; x++) {
            // variable to collect the string number
            let num: string = ``;
            for (let y: number = 0; y < arr[+x].length; y++) {
                // condition to get the cost of the current node
                if (
                    arr[+x][y].charCodeAt(0) >= '0'.charCodeAt(0) &&
                    arr[+x][y].charCodeAt(0) <= '9'.charCodeAt(0)
                ) {
                    num = num + `${arr[+x][y].charCodeAt(0)}`;
                } else {
                    break;
                }
            }
            let value: number = 0;
            // converting from string to int
            if (num) {
                value = parseInt(<any>num);
            }
            // adding the key value pair to our table
            Graph.nodeIndex.set(value, x);
            // creating the node for our graph
            graph[+x].push(new Node());
            // setting its default values
            graph[+x][+0].city = value;
            graph[+x][+0].visited = false;
        }
    }
    // method to set up the connections
    public static addConnections(
        graph: Array<Array<Node>>,
        arr: Array<string>,
        size: number
    ): void {
        for (let x: number = 0; x < size; x++) {
            let num: string = ``;
            // loop to check nodes that connect to the current node
            let text = arr[+x];
            let start: number = text.indexOf(`[`);
            for (let y: number = start + 1; y < arr[+x].length; y++) {
                if (
                    arr[+x][y].charCodeAt(0) >= '0'.charCodeAt(0) &&
                    arr[+x][y].charCodeAt(0) <= '9'.charCodeAt(0)
                ) {
                    num = num + `${arr[+x][y].charCodeAt(0)}`;
                } else {
                    // if current character does not represent a number than convert the string value we collected
                    let valueCost: number = 0;
                    if (num) {
                        valueCost = parseInt(<any>num);
                    }
                    // here we call our make pair function to create the connection
                    // we are connecting the current node to the current cost extracted
                    Graph.makePairs(graph, graph[+x][+0].city, valueCost);
                    // reset the string number variable
                    num = ``;
                }
            }
        }
    }
    // each time we call this method it will reset the visit signal of each node back to false
    public static graphReset(graph: Array<Array<Node>>): void {
        for (let x: number = 0; x < graph.length; x++) {
            graph[+x][+0].visited = false;
        }
    }
    // applying BFS from the current source, as we traverse we add up the population
    public static bfsSum(graph: Array<Array<Node>>, source: Array<Node>): number {
        let list: Array<Array<Node>> = new Array<Array<Node>>();
        list.unshift(source);
        let total: number = 0; // keep track of the total cost from traversing from this source node
        while (list.length > 0) {
            let currentNode: Array<Node> = list[0];
            currentNode[+0].visited = true;
            if (currentNode[+0].city.toString().length > 2) {
                let value = '';
                for (let index = 0; index < currentNode[+0].city.toString().length;) {
                    const element = String.fromCharCode(
                        Number(currentNode[+0].city.toString().substring(index, index + 2))
                    );
                    value = value + element;
                    index = index + 2;
                }
                total += Number(value);
            } else {
                total += Number(String.fromCharCode(currentNode[+0].city));
            }
            list.splice(0, 1);
            // checking the neighbors
            for (let x: number = 1; x < currentNode.length; x++) {
                if (!currentNode[+x].visited) {
                    // adding valid neighbors to our queue
                    list.unshift(
                        graph[+Graph.nodeIndex.get(currentNode[+x].city) as number]
                    );
                }
            }
        }
        return total;
    }
    public static CityTraffic(
        strArr: Array<string>,
        size: number
    ): string | null {
        Graph.nodeIndex.clear(); // clearing our hash table
        // creating our graph and making the connection
        let graph: Array<Array<Node>> = new Array<Array<Node>>(
            ...Arrays.InitializeWithDefaultInstances<Array<Node>>(size)
        );
        Graph.createGraph(graph, strArr, size);
        Graph.addConnections(graph, strArr, size);
        let result: string = ``; // output the final result
        let resultOrder: Array<Array<number>> = new Array<Array<number>>(
            ...Arrays.InitializeWithDefaultInstances<Array<number>>(size)
        ); // will store the integer values of city:max traffic
        /*
              we analyze each city here and check for all possible routes of incoming traffic
              we collect the total population of people coming in from each route
              in each calculation we are only keeping track of the highest incoming population
              */
        for (let x: number = 0; x < graph.length; x++) {
            // reseting our graph each time
            // this step is mandatory so that BFS checks all the valid neighbors
            Graph.graphReset(graph);
            let high: number = 0; // we store the highest possible incoming traffic
            // we set the current city as visited
            graph[+x][+0].visited = true;
            // we take the neighbors
            for (let y: number = 1; y < graph[+x].length; y++) {
                // calling our BFS sum it will return the total cost for this route
                let incomingTraffic: number = Graph.bfsSum(
                    new Array<Array<Node>>(...graph),
                    new Array<Node>(
                        ...graph[+Graph.nodeIndex.get(graph[+x][+y].city) as number]
                    )
                );
                // updating our highest incoming traffic
                if (incomingTraffic > high) {
                    high = incomingTraffic;
                }
            }
            // storing our values in a list for sorting later
            resultOrder[+x].push(graph[+x][+0].city);
            resultOrder[+x].push(high);
        }
        // sorting our list
        //this.sortResult(resultOrder);
        resultOrder = resultOrder.sort((a, b) => a[0] - b[0]);
        // loop to extract the integer values and convert back to a final string result
        for (let x: number = 0; x < resultOrder.length; x++) {
            let convert: number = parseInt(<any>resultOrder[+x][+0]);
            if (convert.toString().length > 2) {
                let value = '';
                for (let index = 0; index < convert.toString().length;) {
                    const element = String.fromCharCode(
                        Number(convert.toString().substring(index, index + 2))
                    );
                    value = value + element;
                    index = index + 2;
                }
                convert = Number(value);
            } else {
                convert = Number(String.fromCharCode(convert));
            }
            result += `${convert}`;
            result += ':';
            convert = parseInt(<any>resultOrder[+x][+1]);
            result += `${convert}`;
            result += ',';
        }
        return result.substr(0, result.length - 1);
    }
}
// a structure representing each vertex
export class Node {
    public city: number = 0;
    public visited: boolean = false;
}
//----------------------------------------------------------------------------------------
//	This class provides the ability to initialize and delete array elements.
//----------------------------------------------------------------------------------------
export class Arrays {
    public static InitializeWithDefaultInstances<T>(length: number): Array<any> {
        let array: Array<any> = new Array<any>(length);
        for (let i: number = 0; i < length; i++) {
            array[+i] = [];
        }
        return array;
    }
}
