import { GraphEdgeModel, GraphNodeModel } from "./graph.model.js";
import { GraphNodeType, GraphRelationType } from "./graph.types.js";

export class GraphRepository {
  async createNodes(nodes: any[]) {
    return GraphNodeModel.insertMany(nodes, { ordered: false });
  }

  async createEdges(edges: any[]) {
    return GraphEdgeModel.insertMany(edges, { ordered: false });
  }

  async clearWorkspaceGraph(workspaceId: string) {
    await Promise.all([
      GraphNodeModel.deleteMany({ workspaceId }),
      GraphEdgeModel.deleteMany({ workspaceId }),
    ]);
  }

  async findOutgoingEdges(workspaceId: string, nodeId: string) {
    return GraphEdgeModel.find({ workspaceId, source: nodeId });
  }

  async findIncomingEdges(workspaceId: string, nodeId: string) {
    return GraphEdgeModel.find({ workspaceId, target: nodeId });
  }

  async findNodebyId(workspaceId: string, nodeId: string) {
    return GraphNodeModel.findOne({ workspaceId, nodeId });
  }

  async findNodesByWorkspace(workspaceId: string) {
    return GraphNodeModel.find({ workspaceId });
  }

  async findEdgesByWorkspace(workspaceId: string) {
    return GraphEdgeModel.find({ workspaceId });
  }

  async getEdgesByRelation(workspaceId: string, relation: GraphRelationType) {
    return GraphEdgeModel.find({
      workspaceId,
      relation,
    });
  }

  async getFileImportEdges(workspaceId: string) {
    return GraphEdgeModel.find({
      workspaceId,
      relation: GraphRelationType.FILE_IMPORTS_FILE,
    });
  }

  async getExternalImportEdges(workspaceId: string) {
    return GraphEdgeModel.find({
      workspaceId,
      relation: GraphRelationType.IMPORTS,
    });
  }

  async getCallEdges(workspaceId: string) {
    return GraphEdgeModel.find({
      workspaceId,
      relation: GraphRelationType.CALLS,
    });
  }

  async getContainsEdges(workspaceId: string) {
    return GraphEdgeModel.find({
      workspaceId,
      relation: GraphRelationType.CONTAINS,
    });
  }

  async getFileNodes(workspaceId: string) {
    return GraphNodeModel.find({
      workspaceId,
      type: {
        $in: [GraphNodeType.FILE, GraphNodeType.ENTRY_FILE],
      },
    });
  }

  async getFunctionNodes(workspaceId: string) {
    return GraphNodeModel.find({
      workspaceId,
      type: {
        $in: [
          GraphNodeType.FUNCTION,
          GraphNodeType.COMPONENT,
          GraphNodeType.METHOD,
        ],
      },
    });
  }

  async getClassNodes(workspaceId: string) {
    return GraphNodeModel.find({
      workspaceId,
      type: GraphNodeType.CLASS,
    });
  }

  async getExternalModules(workspaceId: string) {
    return GraphNodeModel.find({
      workspaceId,
      type: GraphNodeType.EXTERNAL_MODULE,
    });
  }
}
