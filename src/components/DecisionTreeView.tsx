import type { DecisionTreeNode, TreeExplanation } from '../ml/classifierTypes';
import type { FittedDecisionTreeClassifier } from '../ml/classifierTypes';

interface Props { model: FittedDecisionTreeClassifier | null; explanation: TreeExplanation | null; stale: boolean }

function TreeNode({ node, pathIds, depth }: { node: DecisionTreeNode; pathIds: Set<string>; depth: number }) {
  const onPath = pathIds.has(node.id);
  if (node.kind === 'leaf') return <li className={onPath ? 'tree-node on-path' : 'tree-node'}>
    <div className="tree-node-card"><b>Leaf · predicts Group {node.prediction}</b><span>{node.sampleCount} training examples · A {node.counts.A}, B {node.counts.B}</span></div>
  </li>;
  return <li className={onPath ? 'tree-node on-path' : 'tree-node'}>
    <details open={depth === 0 || onPath}>
      <summary><b>{node.feature === 'x' ? 'Feature 1' : 'Feature 2'} &lt; {node.threshold.toFixed(3)}?</b><span>{node.sampleCount} examples · Gini gain {node.gain.toFixed(3)}</span></summary>
      <div className="tree-branches">
        <div><span className="tree-branch-label">Yes · left</span><ul><TreeNode node={node.left} pathIds={pathIds} depth={depth + 1}/></ul></div>
        <div><span className="tree-branch-label">No · right</span><ul><TreeNode node={node.right} pathIds={pathIds} depth={depth + 1}/></ul></div>
      </div>
    </details>
  </li>;
}

export default function DecisionTreeView({ model, explanation, stale }: Props) {
  const pathIds = new Set([...(explanation?.path.map(step => step.nodeId) ?? []), ...(explanation ? [explanation.leaf.id] : [])]);
  if (!model || stale) return <section className="panel tree-view-panel" aria-labelledby="tree-view-title">
    <div className="panel-kicker">LEARNED MODEL</div><h2 id="tree-view-title">Decision tree</h2>
    <p className="tree-empty">{stale ? 'The previous tree is stale. Train the current settings to see its learned structure.' : 'Choose Decision Tree and train to see the structure learned from the training examples.'}</p>
  </section>;
  return <section className="panel tree-view-panel" aria-labelledby="tree-view-title">
    <div className="result-head"><div><div className="panel-kicker">LEARNED MODEL · TRAINING DATA ONLY</div><h2 id="tree-view-title">Decision tree</h2></div><span className="inspect-tag">DEPTH ≤ {model.configuration.maxDepth}</span></div>
    <p className="tree-intro">Each question tests one feature threshold. “Yes” follows the left branch (&lt; threshold); “No” follows the right branch (≥ threshold). Nodes and leaves show examples used to fit them.</p>
    {explanation && <section className="tree-path" aria-live="polite"><h3>Selected point's path · predicts Group {explanation.prediction}</h3>{explanation.path.length ? <ol>{explanation.path.map((step, index) => <li key={step.nodeId}>Step {index + 1}: Feature {step.feature === 'x' ? '1' : '2'} value {step.value.toFixed(3)} is {step.direction === 'left' ? 'less than' : 'at least'} {step.threshold.toFixed(3)}; follow {step.direction}. ({step.sampleCount} examples at this question.)</li>)}</ol> : <p>This tree has no split questions at the root; it predicts from all {explanation.leaf.sampleCount} training examples.</p>}<p>Reached leaf: Group {explanation.leaf.prediction}, A {explanation.leaf.counts.A}, B {explanation.leaf.counts.B}.</p></section>}
    <div className="tree-structure" role="region" aria-label="Scrollable decision tree structure"><ul><TreeNode node={model.tree} pathIds={pathIds} depth={0}/></ul></div>
    <details className="tree-text-alt"><summary>Text-only tree summary</summary><p>The tree has a maximum depth setting of {model.configuration.maxDepth}, currently uses {model.training.length} training examples, and predicts one of Groups A or B. Expand the root question above to navigate its branches. The selected point's route is listed before the diagram.</p></details>
  </section>;
}
