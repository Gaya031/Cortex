import { GraphEdgeModel, GraphNodeModel } from "./graph.model.js";
import { GraphNodeType, GraphRelationType } from "./graph.types.js";

export class GraphRepository {
  async createNodes(nodes: any[]) {
    return GraphNodeModel.insertMany(nodes, { ordered: false });
  }

  async createEdges(edges: any[]) {
    return GraphEdgeModel.insertMany(edges);
  }

  async clearWorkspaceGraph(workspaceId: string) {
    await GraphNodeModel.deleteMany({ workspaceId });
    await GraphEdgeModel.deleteMany({ workspaceId });
  }

  async findOutgoingEdges(workspaceId: string, nodeId: string) {
    return GraphEdgeModel.find({ workspaceId, source: nodeId });
  }

  async findIncomingEdges(workspaceId: string, nodeId: string) {
    return GraphEdgeModel.find({ workspaceId, target: nodeId });
  }

  async getImportEdges(workspaceId: string){
    return GraphEdgeModel.find({workspaceId, relation: GraphRelationType.IMPORTS});
  }

  async getFileNodes(workspaceId: string){
    return GraphNodeModel.find({workspaceId, type: GraphNodeType.FILE});
  }

  async findNodesByWorkspace(workspaceId: string){
    return GraphNodeModel.find({workspaceId});
  }

  async findEdgesByWorkspace(workspaceId: string){
    return GraphEdgeModel.find({workspaceId});
  }
}
