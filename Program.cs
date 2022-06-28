using System;
using System.Collections.Generic;
using System.Linq;

namespace ConsoleApp2
{

    // a structure representing each vertex
    public class Node
	{
		public int city;
		public bool visited;
	}

	public static class Program
	{

		/*
		Our first steps will be to set up the graph
		One approach we can use is to check every city
		Once we arrive at a current city we now check its neighbors, the number of neighbors determine the possible numbers of incoming traffic. Example if a city has 2 neighbors, than is there will be 2 incoming traffics into that city. 
		We can perform a BFS from each neighbor start point and get a total of the population.
		We store the population of each incoming traffic and record only the maximum possible traffic for that city. 
		*/

		// hash map to quickly index the vertices
		public static SortedDictionary<int, int> nodeIndex = new SortedDictionary<int, int>();

		// method to  create a connection between 2 nodes
		public static void makePairs(List<List<Node>> graph, int source, int partner)
		{
			// making the edge connection
			graph[nodeIndex[source]].Add(graph[nodeIndex[partner]][0]);
		}

		// method to create our graph
		public static void createGraph(List<List<Node>> graph, string[] arr, int size)
		{
			// traverse the string array to first extract the cost of each node
			for (int x = 0; x < size; x++)
			{
				// variable to collect the string number
				string num = "";				

				for (int y = 0; y < arr[x].Length; y++)
				{
					// condition to get the cost of the current node
					if (arr[x][y] >= '0' && arr[x][y] <= '9')
					{
						num = num +$"{arr[x][y]}";
					}
					else
					{
						break;
					}
				}
				int value = 0;
				// converting from string to int
				if (!string.IsNullOrEmpty(num))
				{
					value = Convert.ToInt32(num);
				}

				// adding the key value pair to our table
				nodeIndex.Add(value, x);

				// creating the node for our graph
				graph[x].Add(new Node());

				// setting its default values
				graph[x][0].city = value;
				graph[x][0].visited = false;
			}
		}

		// method to set up the connections
		public static void addConnections(List<List<Node>> graph, string[] arr, int size)
		{
			for (int x = 0; x < size; x++)
			{
				string num = "";

				// loop to check nodes that connect to the current node
				int start = arr[x].IndexOf("[");
				for (int y = start + 1; y < arr[x].Length; y++)
				{
					if (arr[x][y] >= '0' && arr[x][y] <= '9')
					{
						num = num + $"{arr[x][y]}";
					}
					else
					{
						// if current character does not represent a number than convert the string value we collected
						int valueCost = 0;
						if (!string.IsNullOrEmpty(num)) { valueCost = Convert.ToInt32(num); }

						// here we call our make pair function to create the connection
						// we are connecting the current node to the current cost extracted
						makePairs(graph, graph[x][0].city, valueCost);

						// reset the string number variable
						num = "";
					}
				}
			}
		}

		// each time we call this method it will reset the visit signal of each node back to false
		public static void graphReset(List<List<Node>> graph)
		{
			for (int x = 0; x < graph.Count; x++)
			{
				graph[x][0].visited = false;
			}
		}

		// applying BFS from the current source, as we traverse we add up the population
		public static int bfsSum(List<List<Node>> graph, List<Node> source)
		{
			Queue<List<Node>> list = new Queue<List<Node>>();

			list.Enqueue(source);

			int total = 0; // keep track of the total cost from traversing from this source node

			while (list.Count > 0)
			{
				List<Node> currentNode = list.First();
				currentNode[0].visited = true;
				total += currentNode[0].city;
				list.Dequeue();

				// checking the neighbors
				for (int x = 1; x < currentNode.Count; x++)
				{
					if (!currentNode[x].visited)
					{
						// adding valid neighbors to our queue
						list.Enqueue(graph[nodeIndex[currentNode[x].city]]);
					}
				}
			}

			return total;
		}

		// sorts our 2d vector which stores the city and max traffic
		// using a quick bubble sort to sort our list
		public static void sortResult(List<List<int>> list)
		{
			bool swap;

			do
			{
				swap = false;

				for (int row = 0; row < list.Count - 1; row++)
				{
					if (list[row][0] > list[row + 1][0])
					{
						int temp1 = list[row][0];
						int temp2 = list[row][1];

						list[row][0] = list[row + 1][0];
						list[row][1] = list[row + 1][1];

						list[row + 1][0] = temp1;
						list[row + 1][1] = temp2;

						swap = true;
					}
				}

			} while (swap);
		}

		public static string CityTraffic(string[] strArr, int size)
		{
			nodeIndex.Clear(); // clearing our hash table

			// creating our graph and making the connection
			List<List<Node>> graph = new List<List<Node>>(Arrays.InitializeWithDefaultInstances<List<Node>>(size));
			createGraph(graph, strArr, size);
			addConnections(graph, strArr, size);

			string result = ""; // output the final result
			List<List<int>> resultOrder = new List<List<int>>(Arrays.InitializeWithDefaultInstances<List<int>>(size)); // will store the integer values of city:max traffic

			/*
			we analyze each city here and check for all possible routes of incoming traffic
			we collect the total population of people coming in from each route
			in each calculation we are only keeping track of the highest incoming population
			*/
			for (int x = 0; x < graph.Count; x++)
			{
				// reseting our graph each time
				// this step is mandatory so that BFS checks all the valid neighbors
				graphReset(graph);

				int high = 0; // we store the highest possible incoming traffic

				// we set the current city as visited
				graph[x][0].visited = true;

				// we take the neighbors
				for (int y = 1; y < graph[x].Count; y++)
				{
					// calling our BFS sum it will return the total cost for this route
					int incomingTraffic = bfsSum(new List<List<Node>>(graph), new List<Node>(graph[nodeIndex[graph[x][y].city]]));

					// updating our highest incoming traffic
					if (incomingTraffic > high)
					{
						high = incomingTraffic;
					}
				}

				// storing our values in a list for sorting later
				resultOrder[x].Add(graph[x][0].city);
				resultOrder[x].Add(high);
			}

			// sorting our list
			//sortResult(resultOrder);
			resultOrder = resultOrder.OrderBy(l => l.First()).ToList();

			// loop to extract the integer values and convert back to a final string result
			for (int x = 0; x < resultOrder.Count; x++)
			{
				int convert = Convert.ToInt32(resultOrder[x][0]);
				result += $"{convert}";
				result += ':';
				convert = Convert.ToInt32(resultOrder[x][1]);
				result += $"{convert}";
				result += ',';
			}

			//result.pop_back(); // removing the last character
			return result.Substring(0,result.Length-1);
		}

		internal static void Main()
		{
			string[] A = { "1:[5]", "4:[5]", "3:[5]", "5:[1,4,3,2]", "2:[5,15,7]", "7:[2,8]", "8:[7,38]", "15:[2]", "38:[8]" };
			Console.WriteLine("A " +string.Join(',',A));
			string[] B = { "1:[5]", "2:[5]", "3:[5]", "4:[5]", "5:[1,2,3,4]" };
			Console.WriteLine("B " + string.Join(',', B));
			string[] C = { "1:[5]", "2:[5,18]", "3:[5,12]", "4:[5]", "5:[1,2,3,4]", "18:[2]", "12:[3]" };
			Console.WriteLine("A "+ (CityTraffic(A, A.Length)));
			Console.WriteLine("B " + (CityTraffic(B, B.Length)));
			Console.ReadKey();
		}
	}
	//----------------------------------------------------------------------------------------
	//	This class provides the ability to initialize and delete array elements.
	//----------------------------------------------------------------------------------------
	internal static class Arrays
	{
		public static T[] InitializeWithDefaultInstances<T>(int length) where T : class, new()
		{
			T[] array = new T[length];
			for (int i = 0; i < length; i++)
			{
				array[i] = new T();
			}
			return array;
		}
	}

}
