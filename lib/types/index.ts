export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  Base64: any;
  DateTime: any;
  Decimal: any;
  JSON: any;
  JSONObject: any;
  URI: any;
  Url64: any;
};

/**
 * An action verb defining the kind of event, commitment, or intent.
 * It is recommended that the lowercase action verb should be used as the
 * record ID in order that references to `Action`s elsewhere in the system
 * are easily readable.
 */
export type Action = {
  __typename?: "Action";
  id: Scalars["String"];
  /** Denotes if a process input or output, or not related to a process. */
  inputOutput?: Maybe<Scalars["String"]>;
  /** A unique verb which defines the action. */
  label: Scalars["String"];
  /**
   * The onhand effect of an economic event on a resource, increment,
   * decrement, no effect, or decrement resource and increment "to"
   * resource.
   */
  onhandEffect: Scalars["String"];
  /**
   * The action that should be included on the other direction of
   * the process, for example accept with modify.
   */
  pairsWith?: Maybe<Scalars["String"]>;
  /**
   * The accounting effect of an economic event on a resource,
   * increment, decrement, no effect, or decrement resource and
   * increment "to" resource.
   */
  resourceEffect: Scalars["String"];
};

/** A person or group or organization with economic agency. */
export type Agent = {
  id: Scalars["ID"];
  /** The image files relevant to the agent, such as a logo, avatar, photo, etc. */
  images?: Maybe<Array<File>>;
  /**
   * An informal or formal textual identifier for an agent.  Does not imply
   * uniqueness.
   */
  name: Scalars["String"];
  /** A textual description or comment. */
  note?: Maybe<Scalars["String"]>;
  /**
   * The main place an agent is located, often an address where activities
   * occur and mail can be sent.  This is usually a mappable geographic
   * location.  It also could be a website address, as in the case of agents
   * who have no physical location.
   */
  primaryLocation?: Maybe<SpatialThing>;
};

export type AgentConnection = {
  __typename?: "AgentConnection";
  edges: Array<AgentEdge>;
  pageInfo: PageInfo;
};

export type AgentEdge = {
  __typename?: "AgentEdge";
  cursor: Scalars["ID"];
  node: Agent;
};

export type AgentFilterParams = {
  name?: InputMaybe<Scalars["String"]>;
};

/**
 * The role of an economic relationship that exists between 2 agents,
 * such as member, trading partner.
 */
export type AgentRelationship = {
  __typename?: "AgentRelationship";
  id: Scalars["ID"];
  /** A textual description or comment. */
  note?: Maybe<Scalars["String"]>;
  /**
   * The object of a relationship between two agents.  For example, if Mary
   * is a member of a group, then the group is the object.
   */
  object: Agent;
  /** A kind of relationship that exists between two agents. */
  relationship: AgentRelationshipRole;
  /**
   * The subject of a relationship between two agents.  For example, if Mary
   * is a member of a group, then Mary is the subject.
   */
  subject: Agent;
};

export type AgentRelationshipConnection = {
  __typename?: "AgentRelationshipConnection";
  edges: Array<AgentRelationshipEdge>;
  pageInfo: PageInfo;
};

export type AgentRelationshipCreateParams = {
  /** A textual description or comment. */
  note?: InputMaybe<Scalars["String"]>;
  /**
   * (`Agent`) The object of a relationship between two agents.  For example, if Mary
   * is a member of a group, then the group is the object.
   */
  object: Scalars["ID"];
  /** (`AgentRelationshipRole`) A kind of relationship that exists between two agents. */
  relationship: Scalars["ID"];
  /**
   * (`Agent`) The subject of a relationship between two agents.  For example, if Mary
   * is a member of a group, then Mary is the subject.
   */
  subject: Scalars["ID"];
};

export type AgentRelationshipEdge = {
  __typename?: "AgentRelationshipEdge";
  cursor: Scalars["ID"];
  node: AgentRelationship;
};

export type AgentRelationshipResponse = {
  __typename?: "AgentRelationshipResponse";
  agentRelationship: AgentRelationship;
};

export type AgentRelationshipRole = {
  __typename?: "AgentRelationshipRole";
  id: Scalars["ID"];
  /** The human readable name of the role, from the object to the subject. */
  inverseRoleLabel?: Maybe<Scalars["String"]>;
  /** A textual description or comment. */
  note?: Maybe<Scalars["String"]>;
  /** The general shape or behavior grouping of an agent relationship role. */
  roleBehavior?: Maybe<RoleBehavior>;
  /** The human readable name of the role, from the subject to the object. */
  roleLabel: Scalars["String"];
};

export type AgentRelationshipRoleConnection = {
  __typename?: "AgentRelationshipRoleConnection";
  edges: Array<AgentRelationshipRoleEdge>;
  pageInfo: PageInfo;
};

export type AgentRelationshipRoleCreateParams = {
  /** The human readable name of the role, from the object to the subject. */
  inverseRoleLabel?: InputMaybe<Scalars["String"]>;
  /** A textual description or comment. */
  note?: InputMaybe<Scalars["String"]>;
  /** (`RoleBehavior`) The general shape or behavior grouping of an agent relationship role. */
  roleBehavior?: InputMaybe<Scalars["ID"]>;
  /** The human readable name of the role, from the subject to the object. */
  roleLabel: Scalars["String"];
};

export type AgentRelationshipRoleEdge = {
  __typename?: "AgentRelationshipRoleEdge";
  cursor: Scalars["ID"];
  node: AgentRelationshipRole;
};

export type AgentRelationshipRoleResponse = {
  __typename?: "AgentRelationshipRoleResponse";
  agentRelationshipRole: AgentRelationshipRole;
};

export type AgentRelationshipRoleUpdateParams = {
  id: Scalars["ID"];
  /** The human readable name of the role, from the object to the subject. */
  inverseRoleLabel?: InputMaybe<Scalars["String"]>;
  /** A textual description or comment. */
  note?: InputMaybe<Scalars["String"]>;
  /** (`RoleBehavior`) The general shape or behavior grouping of an agent relationship role. */
  roleBehavior?: InputMaybe<Scalars["ID"]>;
  /** The human readable name of the role, from the subject to the object. */
  roleLabel?: InputMaybe<Scalars["String"]>;
};

export type AgentRelationshipUpdateParams = {
  id: Scalars["ID"];
  /** A textual description or comment. */
  note?: InputMaybe<Scalars["String"]>;
  /**
   * (`Agent`) The object of a relationship between two agents.  For example, if Mary
   * is a member of a group, then the group is the object.
   */
  object?: InputMaybe<Scalars["ID"]>;
  /** (`AgentRelationshipRole`) A kind of relationship that exists between two agents. */
  relationship?: InputMaybe<Scalars["ID"]>;
  /**
   * (`Agent`) The subject of a relationship between two agents.  For example, if Mary
   * is a member of a group, then Mary is the subject.
   */
  subject?: InputMaybe<Scalars["ID"]>;
};

export type Agreement = {
  __typename?: "Agreement";
  /** The date and time the agreement was created. */
  created: Scalars["DateTime"];
  id: Scalars["ID"];
  /**
   * An informal or formal textual identifier for an agreement.  Does not
   * imply uniqueness.
   */
  name: Scalars["String"];
  /** A textual description or comment. */
  note?: Maybe<Scalars["String"]>;
};

export type AgreementConnection = {
  __typename?: "AgreementConnection";
  edges: Array<AgreementEdge>;
  pageInfo: PageInfo;
};

export type AgreementCreateParams = {
  /**
   * An informal or formal textual identifier for an agreement.  Does not
   * imply uniqueness.
   */
  name: Scalars["String"];
  /** A textual description or comment. */
  note?: InputMaybe<Scalars["String"]>;
};

export type AgreementEdge = {
  __typename?: "AgreementEdge";
  cursor: Scalars["ID"];
  node: Agreement;
};

export type AgreementResponse = {
  __typename?: "AgreementResponse";
  agreement: Agreement;
};

export type AgreementUpdateParams = {
  id: Scalars["ID"];
  /**
   * An informal or formal textual identifier for an agreement.  Does not
   * imply uniqueness.
   */
  name?: InputMaybe<Scalars["String"]>;
  /** A textual description or comment. */
  note?: InputMaybe<Scalars["String"]>;
};

/** A `Duration` represents an interval between two `DateTime` values. */
export type Duration = {
  __typename?: "Duration";
  /** A number representing the duration, will be paired with a unit. */
  numericDuration: Scalars["Decimal"];
  /** A unit of measure. */
  unitType: TimeUnit;
};

/**
 * An observed economic flow, as opposed to a flow planned to happen in
 * the future.  This could reflect a change in the quantity of an economic
 * resource.  It is also defined by its behavior in relation to the economic
 * resource (see `Action`).
 */
export type EconomicEvent = {
  __typename?: "EconomicEvent";
  /**
   * Relates an economic event to a verb, such as consume, produce, work,
   * improve, etc.
   */
  action: Action;
  /**
   * Reference to an agreement between agents which specifies the rules or
   * policies or calculations which govern this economic event.
   */
  agreedIn?: Maybe<Scalars["String"]>;
  /** The place where an economic event occurs.  Usually mappable. */
  atLocation?: Maybe<SpatialThing>;
  /**
   * The amount and unit of the work or use or citation effort-based action.
   * This is often a time duration, but also could be cycle counts or other
   * measures of effort or usefulness.
   */
  effortQuantity?: Maybe<Measure>;
  /** The beginning of the economic event. */
  hasBeginning?: Maybe<Scalars["DateTime"]>;
  /** The end of the economic event. */
  hasEnd?: Maybe<Scalars["DateTime"]>;
  /** The date/time at which the economic event occurred.  Can be used instead of beginning and end." */
  hasPointInTime?: Maybe<Scalars["DateTime"]>;
  id: Scalars["ID"];
  /** Defines the process to which this event is an input. */
  inputOf?: Maybe<Process>;
  /** A textual description or comment. */
  note?: Maybe<Scalars["String"]>;
  /** Defines the process to which this event is an output. */
  outputOf?: Maybe<Process>;
  /** Used to implement the trace algorithm. */
  previous?: Maybe<ProductionFlowItem>;
  /**
   * Used to implement the trace algorithm.  It is described in
   * the algorithms section of Valueflow's website.
   */
  previousEvent?: Maybe<EconomicEvent>;
  /** The economic agent from whom the actual economic event is initiated. */
  provider: Agent;
  /** This economic event occurs as part of this agreement. */
  realizationOf?: Maybe<Agreement>;
  /** The economic agent whom the actual economic event is for. */
  receiver: Agent;
  /**
   * References a concept in a common taxonomy or other classification scheme
   * for purposes of categorization or grouping.
   */
  resourceClassifiedAs?: Maybe<Array<Scalars["URI"]>>;
  /**
   * The primary resource specification or definition of an existing or
   * potential economic resource.  A resource will have only one, as this
   * specifies exactly what the resource is.
   */
  resourceConformsTo?: Maybe<ResourceSpecification>;
  /** Economic resource involved in the economic event. */
  resourceInventoriedAs?: Maybe<EconomicResource>;
  /** Metadata of the project. */
  resourceMetadata?: Maybe<Scalars["JSONObject"]>;
  /**
   * The amount and unit of the economic resource counted or inventoried.
   * This is the quantity that could be used to increment or decrement a
   * resource, depending on the type of resource and resource effect of action.
   */
  resourceQuantity?: Maybe<Measure>;
  /** The new location of the receiver resource. */
  toLocation?: Maybe<SpatialThing>;
  /**
   * Additional economic resource on the economic event when needed by the
   * receiver.  Used when a transfer or move, or sometimes other actions,
   * requires explicitly identifying an economic resource on the receiving
   * side.
   */
  toResourceInventoriedAs?: Maybe<EconomicResource>;
  /** References another economic event that implied this economic event, often based on a prior agreement. */
  triggeredBy?: Maybe<EconomicEvent>;
};

export type EconomicEventConnection = {
  __typename?: "EconomicEventConnection";
  edges: Array<EconomicEventEdge>;
  pageInfo: PageInfo;
};

export type EconomicEventCreateParams = {
  /**
   * Relates an economic event to a verb, such as consume, produce, work,
   * improve, etc.
   */
  action: Scalars["String"];
  /**
   * Reference to an agreement between agents which specifies the rules or
   * policies or calculations which govern this economic event.
   */
  agreedIn?: InputMaybe<Scalars["String"]>;
  /** (`SpatialThing`) The place where an economic event occurs.  Usually mappable. */
  atLocation?: InputMaybe<Scalars["ID"]>;
  /**
   * The amount and unit of the work or use or citation effort-based action.
   * This is often a time duration, but also could be cycle counts or other
   * measures of effort or usefulness.
   */
  effortQuantity?: InputMaybe<IMeasure>;
  /** The beginning of the economic event. */
  hasBeginning?: InputMaybe<Scalars["DateTime"]>;
  /** The end of the economic event. */
  hasEnd?: InputMaybe<Scalars["DateTime"]>;
  /** The date/time at which the economic event occurred.  Can be used instead of beginning and end." */
  hasPointInTime?: InputMaybe<Scalars["DateTime"]>;
  /** (`Process`) Defines the process to which this event is an input. */
  inputOf?: InputMaybe<Scalars["ID"]>;
  /** A textual description or comment. */
  note?: InputMaybe<Scalars["String"]>;
  /** (`Process`) Defines the process to which this event is an output. */
  outputOf?: InputMaybe<Scalars["ID"]>;
  /** (`Agent`) The economic agent from whom the actual economic event is initiated. */
  provider?: InputMaybe<Scalars["ID"]>;
  /** (`Agreement`) This economic event occurs as part of this agreement. */
  realizationOf?: InputMaybe<Scalars["ID"]>;
  /** (`Agent`) The economic agent whom the actual economic event is for. */
  receiver?: InputMaybe<Scalars["ID"]>;
  /**
   * References a concept in a common taxonomy or other classification scheme
   * for purposes of categorization or grouping.
   */
  resourceClassifiedAs?: InputMaybe<Array<Scalars["URI"]>>;
  /**
   * (`ResourceSpecification`) The primary resource specification or definition of an existing or
   * potential economic resource.  A resource will have only one, as this
   * specifies exactly what the resource is.
   */
  resourceConformsTo?: InputMaybe<Scalars["ID"]>;
  /** (`EconomicResource`) Economic resource involved in the economic event. */
  resourceInventoriedAs?: InputMaybe<Scalars["ID"]>;
  /** Metadata of the project. */
  resourceMetadata?: InputMaybe<Scalars["JSONObject"]>;
  /**
   * The amount and unit of the economic resource counted or inventoried.
   * This is the quantity that could be used to increment or decrement a
   * resource, depending on the type of resource and resource effect of action.
   */
  resourceQuantity?: InputMaybe<IMeasure>;
  /** (`SpatialThing`) The new location of the receiver resource. */
  toLocation?: InputMaybe<Scalars["ID"]>;
  /**
   * (`EconomicResource`) Additional economic resource on the economic event when needed by the
   * receiver.  Used when a transfer or move, or sometimes other actions,
   * requires explicitly identifying an economic resource on the receiving
   * side.
   */
  toResourceInventoriedAs?: InputMaybe<Scalars["ID"]>;
  /** (`EconomicEvent`) References another economic event that implied this economic event, often based on a prior agreement. */
  triggeredBy?: InputMaybe<Scalars["ID"]>;
};

export type EconomicEventEdge = {
  __typename?: "EconomicEventEdge";
  cursor: Scalars["ID"];
  node: EconomicEvent;
};

export type EconomicEventResponse = {
  __typename?: "EconomicEventResponse";
  /** Details of the newly created event. */
  economicEvent: EconomicEvent;
};

export type EconomicEventUpdateParams = {
  /**
   * Reference to an agreement between agents which specifies the rules or
   * policies or calculations which govern this economic event.
   */
  agreedIn?: InputMaybe<Scalars["String"]>;
  id: Scalars["ID"];
  /** A textual description or comment. */
  note?: InputMaybe<Scalars["String"]>;
  /** (`Agreement`) This economic event occurs as part of this agreement. */
  realizationOf?: InputMaybe<Scalars["ID"]>;
  /** (`EconomicEvent`) References another economic event that implied this economic event, often based on a prior agreement. */
  triggeredBy?: InputMaybe<Scalars["ID"]>;
};

/** A resource which is useful to people or the ecosystem. */
export type EconomicResource = {
  __typename?: "EconomicResource";
  /**
   * The current amount and unit of the economic resource for which the
   * agent has primary rights and responsibilities, sometimes thought of as
   * ownership.  This can be either stored or derived from economic events
   * affecting the resource.
   */
  accountingQuantity: Measure;
  /**
   * References one or more concepts in a common taxonomy or other
   * classification scheme for purposes of categorization or grouping.
   */
  classifiedAs?: Maybe<Array<Scalars["URI"]>>;
  /**
   * The primary resource specification or definition of an existing or
   * potential economic resource.  A resource will have only one, as this
   * specifies exactly what the resource is.
   */
  conformsTo: ResourceSpecification;
  /**
   * Used when a stock economic resource contains items also defined as
   * economic resources.
   */
  containedIn?: Maybe<EconomicResource>;
  /**
   * The current place an economic resource is located.  Could be at any
   * level of granularity, from a town to an address to a warehouse location.
   * Usually mappable.
   */
  currentLocation?: Maybe<SpatialThing>;
  /**
   * The agent who holds the physical custody of this resource.  It is the
   * agent that is associated with the onhandQuantity of the economic resource.
   */
  custodian: Agent;
  id: Scalars["ID"];
  /** The image files relevant to the entity, such as a photo, diagram, etc. */
  images?: Maybe<Array<File>>;
  /** States the licenses under which the project is made available. */
  license?: Maybe<Scalars["String"]>;
  /** States who is licensing the project. */
  licensor?: Maybe<Scalars["String"]>;
  /**
   * Lot or batch of an economic resource, used to track forward or backwards
   * to all occurrences of resources of that lot.  Note more than one resource
   * can be of the same lot.
   */
  lot?: Maybe<ProductBatch>;
  /** Metadata of the project. */
  metadata?: Maybe<Scalars["JSONObject"]>;
  /**
   * An informal or formal textual identifier for an item.  Does not imply
   * uniqueness.
   */
  name: Scalars["String"];
  /** A textual description or comment. */
  note?: Maybe<Scalars["String"]>;
  /** The okh version of the standard of the manifest. */
  okhv?: Maybe<Scalars["String"]>;
  /**
   * The current amount and unit of the economic resource which is under
   * direct control of the agent.  It may be more or less than the accounting
   * quantity.  This can be either stored or derived from economic events
   * affecting the resource.
   */
  onhandQuantity: Measure;
  /** Used to implement the trace algorithm. */
  previous?: Maybe<Array<EconomicEvent>>;
  /**
   * The agent currently with primary rights and responsibilites for
   * the economic resource.  It is the agent that is associated with the
   * accountingQuantity of the economic resource.
   */
  primaryAccountable: Agent;
  /** A URL to the repository of the project. */
  repo?: Maybe<Scalars["String"]>;
  /**
   * References the ProcessSpecification of the last process the desired
   * economic resource went through.  Stage is used when the last process
   * is important for finding proper resources, such as where the publishing
   * process wants only documents that have gone through the editing process.
   */
  stage?: Maybe<ProcessSpecification>;
  /**
   * The state of the desired economic resource (pass or fail), after coming
   * out of a test or review process.  Can be derived from the last event if
   * a pass or fail event.
   */
  state?: Maybe<Action>;
  trace?: Maybe<Array<TrackTraceItem>>;
  traceDpp: Scalars["JSON"];
  /**
   * Sometimes called serial number, used when each item must have a traceable
   * identifier (like a computer).  Could also be used for other unique
   * tracking identifiers needed for resources.
   */
  trackingIdentifier?: Maybe<Scalars["String"]>;
  /** The unit used for use or work or cite actions for this resource. */
  unitOfEffort?: Maybe<Unit>;
  /** The version of the project. */
  version?: Maybe<Scalars["String"]>;
};

export type EconomicResourceClassificationsFilterParams = {
  notUri?: InputMaybe<Scalars["URI"]>;
  orUri?: InputMaybe<Scalars["URI"]>;
  uri?: InputMaybe<Scalars["URI"]>;
};

export type EconomicResourceConnection = {
  __typename?: "EconomicResourceConnection";
  edges: Array<EconomicResourceEdge>;
  pageInfo: PageInfo;
};

export type EconomicResourceCreateParams = {
  /** The image files relevant to the entity, such as a photo, diagram, etc. */
  images?: InputMaybe<Array<IFile>>;
  /** States the licenses under which the project is made available. */
  license?: InputMaybe<Scalars["String"]>;
  /** States who is licensing the project. */
  licensor?: InputMaybe<Scalars["String"]>;
  /**
   * (`ProductBatch`) Lot or batch of an economic resource, used to track forward or backwards
   * to all occurrences of resources of that lot.  Note more than one resource
   * can be of the same lot.
   */
  lot?: InputMaybe<Scalars["ID"]>;
  /**
   * An informal or formal textual identifier for an item.  Does not imply
   * uniqueness.
   */
  name?: InputMaybe<Scalars["String"]>;
  /** A textual description or comment. */
  note?: InputMaybe<Scalars["String"]>;
  /** The okh version of the standard of the manifest. */
  okhv?: InputMaybe<Scalars["String"]>;
  /** A URL to the repository of the project. */
  repo?: InputMaybe<Scalars["String"]>;
  /**
   * Sometimes called serial number, used when each item must have a traceable
   * identifier (like a computer).  Could also be used for other unique
   * tracking identifiers needed for resources.
   */
  trackingIdentifier?: InputMaybe<Scalars["String"]>;
  /** The version of the project. */
  version?: InputMaybe<Scalars["String"]>;
};

export type EconomicResourceEdge = {
  __typename?: "EconomicResourceEdge";
  cursor: Scalars["ID"];
  node: EconomicResource;
};

export type EconomicResourceFilterParams = {
  classifiedAs?: InputMaybe<Array<Scalars["URI"]>>;
  conformsTo?: InputMaybe<Array<Scalars["ID"]>>;
  custodian?: InputMaybe<Array<Scalars["ID"]>>;
  gtOnhandQuantityHasNumericalValue?: InputMaybe<Scalars["Decimal"]>;
  id?: InputMaybe<Array<Scalars["ID"]>>;
  name?: InputMaybe<Scalars["String"]>;
  notCustodian?: InputMaybe<Array<Scalars["ID"]>>;
  notPrimaryAccountable?: InputMaybe<Array<Scalars["ID"]>>;
  note?: InputMaybe<Scalars["String"]>;
  orClassifiedAs?: InputMaybe<Array<Scalars["URI"]>>;
  orConformsTo?: InputMaybe<Array<Scalars["ID"]>>;
  orCustodian?: InputMaybe<Array<Scalars["ID"]>>;
  orGtOnhandQuantityHasNumericalValue?: InputMaybe<Scalars["Decimal"]>;
  orId?: InputMaybe<Array<Scalars["ID"]>>;
  orName?: InputMaybe<Scalars["String"]>;
  orNote?: InputMaybe<Scalars["String"]>;
  orPrimaryAccountable?: InputMaybe<Array<Scalars["ID"]>>;
  orRepo?: InputMaybe<Scalars["String"]>;
  primaryAccountable?: InputMaybe<Array<Scalars["ID"]>>;
  repo?: InputMaybe<Scalars["String"]>;
};

export type EconomicResourceResponse = {
  __typename?: "EconomicResourceResponse";
  economicResource: EconomicResource;
};

export type EconomicResourceUpdateParams = {
  /**
   * References one or more concepts in a common taxonomy or other
   * classification scheme for purposes of categorization or grouping.
   */
  classifiedAs?: InputMaybe<Array<Scalars["URI"]>>;
  id: Scalars["ID"];
  /**
   * An informal or formal textual identifier for an item.  Does not imply
   * uniqueness.
   */
  name?: InputMaybe<Scalars["String"]>;
  /** A textual description or comment. */
  note?: InputMaybe<Scalars["String"]>;
  /** A URL to the repository of the project. */
  repo?: InputMaybe<Scalars["String"]>;
};

export type File = {
  __typename?: "File";
  bin?: Maybe<Scalars["Base64"]>;
  date: Scalars["DateTime"];
  description: Scalars["String"];
  extension: Scalars["String"];
  hash: Scalars["Url64"];
  mimeType: Scalars["String"];
  name: Scalars["String"];
  signature?: Maybe<Scalars["String"]>;
  size: Scalars["Int"];
};

/** Mutation input structure for defining time durations. */
export type IDuration = {
  /** A number representing the duration, will be paired with a unit. */
  numericDuration: Scalars["Decimal"];
  /** A unit of measure. */
  unitType: TimeUnit;
};

export type IFile = {
  description: Scalars["String"];
  extension: Scalars["String"];
  hash: Scalars["Url64"];
  mimeType: Scalars["String"];
  name: Scalars["String"];
  size: Scalars["Int"];
};

/**
 * Mutation input structure for defining measurements.  Should be nulled
 * if not present, rather than empty.
 */
export type IMeasure = {
  /** A number representing the quantity, will be paired with a unit. */
  hasNumericalValue: Scalars["Decimal"];
  /** (`Unit`) A unit of measure. */
  hasUnit?: InputMaybe<Scalars["ID"]>;
};

export type InstanceSpecs = {
  __typename?: "InstanceSpecs";
  specCurrency: ResourceSpecification;
  specProjectDesign: ResourceSpecification;
  specProjectProduct: ResourceSpecification;
  specProjectService: ResourceSpecification;
};

export type InstanceUnits = {
  __typename?: "InstanceUnits";
  unitOne: Unit;
};

export type InstanceVariables = {
  __typename?: "InstanceVariables";
  specs: InstanceSpecs;
  units: InstanceUnits;
};

/**
 * A planned economic flow which has not been committed to, which can lead
 * to EconomicEvents (sometimes through Commitments).
 */
export type Intent = {
  __typename?: "Intent";
  /** Relates an intent to a verb, such as consume, produce, work, improve, etc. */
  action: Action;
  /**
   * Reference to an agreement between agents which specifies the rules or
   * policies or calculations which govern this intent.
   */
  agreedIn?: Maybe<Scalars["URI"]>;
  /** The place where an intent would occur.  Usually mappable. */
  atLocation?: Maybe<SpatialThing>;
  /** The total quantity of the offered resource available. */
  availableQuantity?: Maybe<Measure>;
  /** The intent can be safely deleted, has no dependent information. */
  deletable: Scalars["Boolean"];
  /** The time something is expected to be complete. */
  due?: Maybe<Scalars["DateTime"]>;
  /**
   * The amount and unit of the work or use or citation effort-based action.
   * This is often a time duration, but also could be cycle counts or other
   * measures of effort or usefulness.
   */
  effortQuantity?: Maybe<Measure>;
  /**
   * The intent is complete or not.  This is irrespective of if the original
   * goal has been met, and indicates that no more will be done.
   */
  finished: Scalars["Boolean"];
  /** The planned beginning of the intent. */
  hasBeginning?: Maybe<Scalars["DateTime"]>;
  /** The planned end of the intent. */
  hasEnd?: Maybe<Scalars["DateTime"]>;
  /**
   * The planned date/time for the intent.  Can be used instead of beginning
   * and end.
   */
  hasPointInTime?: Maybe<Scalars["DateTime"]>;
  id: Scalars["ID"];
  /** The image files relevant to the intent, such as a photo. */
  images?: Maybe<Array<File>>;
  /** Defines the process to which this intent is an input. */
  inputOf?: Maybe<Process>;
  /**
   * An informal or formal textual identifier for an intent.  Does not imply
   * uniqueness.
   */
  name?: Maybe<Scalars["String"]>;
  /** A textual description or comment. */
  note?: Maybe<Scalars["String"]>;
  /** Defines the process to which this intent is an output. */
  outputOf?: Maybe<Process>;
  /**
   * The economic agent from whom the intent is initiated.  This implies that
   * the intent is an offer.
   */
  provider?: Maybe<Agent>;
  publishedIn?: Maybe<Array<ProposedIntent>>;
  /**
   * The economic agent whom the intent is for.  This implies that the intent
   * is a request.
   */
  receiver?: Maybe<Agent>;
  /**
   * References a concept in a common taxonomy or other classification scheme
   * for purposes of categorization or grouping.
   */
  resourceClassifiedAs?: Maybe<Array<Scalars["URI"]>>;
  /**
   * The primary resource specification or definition of an existing or
   * potential economic resource.  A resource will have only one, as this
   * specifies exactly what the resource is.
   */
  resourceConformsTo?: Maybe<ResourceSpecification>;
  /**
   * When a specific `EconomicResource` is known which can service the
   * `Intent`, this defines that resource.
   */
  resourceInventoriedAs?: Maybe<EconomicResource>;
  /**
   * The amount and unit of the economic resource counted or inventoried.  This
   * is the quantity that could be used to increment or decrement a resource,
   * depending on the type of resource and resource effect of action.
   */
  resourceQuantity?: Maybe<Measure>;
};

export type IntentConnection = {
  __typename?: "IntentConnection";
  edges: Array<IntentEdge>;
  pageInfo: PageInfo;
};

export type IntentCreateParams = {
  /** (`Action`) Relates an intent to a verb, such as consume, produce, work, improve, etc. */
  action: Scalars["String"];
  /**
   * Reference to an agreement between agents which specifies the rules or
   * policies or calculations which govern this intent.
   */
  agreedIn?: InputMaybe<Scalars["URI"]>;
  /** (`SpatialThing`) The place where an intent would occur.  Usually mappable. */
  atLocation?: InputMaybe<Scalars["ID"]>;
  /** The total quantity of the offered resource available. */
  availableQuantity?: InputMaybe<IMeasure>;
  /** The time something is expected to be complete. */
  due?: InputMaybe<Scalars["DateTime"]>;
  /**
   * The amount and unit of the work or use or citation effort-based action.
   * This is often a time duration, but also could be cycle counts or other
   * measures of effort or usefulness.
   */
  effortQuantity?: InputMaybe<IMeasure>;
  /**
   * The intent is complete or not.  This is irrespective of if the original
   * goal has been met, and indicates that no more will be done.
   */
  finished?: InputMaybe<Scalars["Boolean"]>;
  /** The planned beginning of the intent. */
  hasBeginning?: InputMaybe<Scalars["DateTime"]>;
  /** The planned end of the intent. */
  hasEnd?: InputMaybe<Scalars["DateTime"]>;
  /**
   * The planned date/time for the intent.  Can be used instead of beginning
   * and end.
   */
  hasPointInTime?: InputMaybe<Scalars["DateTime"]>;
  /** The image files relevant to the intent, such as a photo. */
  images?: InputMaybe<Array<IFile>>;
  /** (`Process`) Defines the process to which this intent is an input. */
  inputOf?: InputMaybe<Scalars["ID"]>;
  /**
   * An informal or formal textual identifier for an intent.  Does not imply
   * uniqueness.
   */
  name?: InputMaybe<Scalars["String"]>;
  /** A textual description or comment. */
  note?: InputMaybe<Scalars["String"]>;
  /** (`Process`) Defines the process to which this intent is an output. */
  outputOf?: InputMaybe<Scalars["ID"]>;
  /**
   * (`Agent`) The economic agent from whom the intent is initiated.  This implies that
   * the intent is an offer.
   */
  provider?: InputMaybe<Scalars["ID"]>;
  /**
   * (`Agent`) The economic agent whom the intent is for.  This implies that the intent
   * is a request.
   */
  receiver?: InputMaybe<Scalars["ID"]>;
  /**
   * References a concept in a common taxonomy or other classification scheme
   * for purposes of categorization or grouping.
   */
  resourceClassifiedAs?: InputMaybe<Array<Scalars["URI"]>>;
  /**
   * (`ResourceSpecification`) The primary resource specification or definition of an existing or
   * potential economic resource.  A resource will have only one, as this
   * specifies exactly what the resource is.
   */
  resourceConformsTo?: InputMaybe<Scalars["ID"]>;
  /**
   * (`EconomicResource`) When a specific `EconomicResource` is known which can service the
   * `Intent`, this defines that resource.
   */
  resourceInventoriedAs?: InputMaybe<Scalars["ID"]>;
  /**
   * The amount and unit of the economic resource counted or inventoried.  This
   * is the quantity that could be used to increment or decrement a resource,
   * depending on the type of resource and resource effect of action.
   */
  resourceQuantity?: InputMaybe<IMeasure>;
};

export type IntentEdge = {
  __typename?: "IntentEdge";
  cursor: Scalars["ID"];
  node: Intent;
};

export type IntentResponse = {
  __typename?: "IntentResponse";
  intent: Intent;
};

export type IntentUpdateParams = {
  /** (`Action`) Relates an intent to a verb, such as consume, produce, work, improve, etc. */
  action?: InputMaybe<Scalars["String"]>;
  /**
   * Reference to an agreement between agents which specifies the rules or
   * policies or calculations which govern this intent.
   */
  agreedIn?: InputMaybe<Scalars["URI"]>;
  /** (`SpatialThing`) The place where an intent would occur.  Usually mappable. */
  atLocation?: InputMaybe<Scalars["ID"]>;
  /** The total quantity of the offered resource available. */
  availableQuantity?: InputMaybe<IMeasure>;
  /** The time something is expected to be complete. */
  due?: InputMaybe<Scalars["DateTime"]>;
  /**
   * The amount and unit of the work or use or citation effort-based action.
   * This is often a time duration, but also could be cycle counts or other
   * measures of effort or usefulness.
   */
  effortQuantity?: InputMaybe<IMeasure>;
  /**
   * The intent is complete or not.  This is irrespective of if the original
   * goal has been met, and indicates that no more will be done.
   */
  finished?: InputMaybe<Scalars["Boolean"]>;
  /** The planned beginning of the intent. */
  hasBeginning?: InputMaybe<Scalars["DateTime"]>;
  /** The planned end of the intent. */
  hasEnd?: InputMaybe<Scalars["DateTime"]>;
  /**
   * The planned date/time for the intent.  Can be used instead of beginning
   * and end.
   */
  hasPointInTime?: InputMaybe<Scalars["DateTime"]>;
  id: Scalars["ID"];
  /** The image files relevant to the intent, such as a photo. */
  images?: InputMaybe<Array<IFile>>;
  /** (`Process`) Defines the process to which this intent is an input. */
  inputOf?: InputMaybe<Scalars["ID"]>;
  /**
   * An informal or formal textual identifier for an intent.  Does not imply
   * uniqueness.
   */
  name?: InputMaybe<Scalars["String"]>;
  /** A textual description or comment. */
  note?: InputMaybe<Scalars["String"]>;
  /** (`Process`) Defines the process to which this intent is an output. */
  outputOf?: InputMaybe<Scalars["ID"]>;
  /**
   * (`Agent`) The economic agent from whom the intent is initiated.  This implies that
   * the intent is an offer.
   */
  provider?: InputMaybe<Scalars["ID"]>;
  /**
   * (`Agent`) The economic agent whom the intent is for.  This implies that the intent
   * is a request.
   */
  receiver?: InputMaybe<Scalars["ID"]>;
  /**
   * References a concept in a common taxonomy or other classification scheme
   * for purposes of categorization or grouping.
   */
  resourceClassifiedAs?: InputMaybe<Array<Scalars["URI"]>>;
  /**
   * (`ResourceSpecification`) The primary resource specification or definition of an existing or
   * potential economic resource.  A resource will have only one, as this
   * specifies exactly what the resource is.
   */
  resourceConformsTo?: InputMaybe<Scalars["ID"]>;
  /**
   * (`EconomicResource`) When a specific `EconomicResource` is known which can service the
   * `Intent`, this defines that resource.
   */
  resourceInventoriedAs?: InputMaybe<Scalars["ID"]>;
  /**
   * The amount and unit of the economic resource counted or inventoried.  This
   * is the quantity that could be used to increment or decrement a resource,
   * depending on the type of resource and resource effect of action.
   */
  resourceQuantity?: InputMaybe<IMeasure>;
};

/**
 * Semantic meaning for measurements: binds a quantity to its measurement
 * unit.  See http://www.qudt.org/pages/QUDToverviewPage.html .
 */
export type Measure = {
  __typename?: "Measure";
  /** A number representing the quantity, will be paired with a unit. */
  hasNumericalValue: Scalars["Decimal"];
  /** A unit of measure. */
  hasUnit?: Maybe<Unit>;
};

/** A formal or informal group, or legal organization. */
export type Organization = Agent & {
  __typename?: "Organization";
  /**
   * References one or more concepts in a common taxonomy or other
   * classification scheme for purposes of categorization or grouping.
   */
  classifiedAs?: Maybe<Array<Scalars["String"]>>;
  id: Scalars["ID"];
  /** The image files relevant to the agent, such as a logo, avatar, photo, etc. */
  images?: Maybe<Array<File>>;
  /** The name that this agent will be referred to by. */
  name: Scalars["String"];
  /** A textual description or comment. */
  note?: Maybe<Scalars["String"]>;
  /**
   * The main place an agent is located, often an address where activities
   * occur and mail can be sent.	 This is usually a mappable geographic
   * location.  It also could be a website address, as in the case of agents
   * who have no physical location.
   */
  primaryLocation?: Maybe<SpatialThing>;
};

export type OrganizationConnection = {
  __typename?: "OrganizationConnection";
  edges: Array<OrganizationEdge>;
  pageInfo: PageInfo;
};

export type OrganizationCreateParams = {
  /**
   * References one or more concepts in a common taxonomy or other
   * classification scheme for purposes of categorization or grouping.
   */
  classifiedAs?: InputMaybe<Array<Scalars["String"]>>;
  /** The image files relevant to the agent, such as a logo, avatar, photo, etc. */
  images?: InputMaybe<Array<IFile>>;
  /** The name that this agent will be referred to by. */
  name: Scalars["String"];
  /** A textual description or comment. */
  note?: InputMaybe<Scalars["String"]>;
  /**
   * (`SpatialThing`) The main place an agent is located, often an address where activities
   * occur and mail can be sent.	 This is usually a mappable geographic
   * location.  It also could be a website address, as in the case of agents
   * who have no physical location.
   */
  primaryLocation?: InputMaybe<Scalars["ID"]>;
};

export type OrganizationEdge = {
  __typename?: "OrganizationEdge";
  cursor: Scalars["ID"];
  node: Organization;
};

export type OrganizationFilterParams = {
  name?: InputMaybe<Scalars["String"]>;
};

export type OrganizationResponse = {
  __typename?: "OrganizationResponse";
  agent: Organization;
};

export type OrganizationUpdateParams = {
  /**
   * References one or more concepts in a common taxonomy or other
   * classification scheme for purposes of categorization or grouping.
   */
  classifiedAs?: InputMaybe<Array<Scalars["String"]>>;
  id: Scalars["ID"];
  /** The name that this agent will be referred to by. */
  name?: InputMaybe<Scalars["String"]>;
  /** A textual description or comment. */
  note?: InputMaybe<Scalars["String"]>;
  /**
   * (`SpatialThing`) The main place an agent is located, often an address where activities
   * occur and mail can be sent.	 This is usually a mappable geographic
   * location.  It also could be a website address, as in the case of agents
   * who have no physical location.
   */
  primaryLocation?: InputMaybe<Scalars["ID"]>;
};

/** Cursors for pagination */
export type PageInfo = {
  __typename?: "PageInfo";
  /**
   * Cursor pointing to the last of the results returned, to be used
   * with `after` query parameter if the backend supports forward
   * pagination.
   */
  endCursor?: Maybe<Scalars["ID"]>;
  /**
   * True if there are more results after `endCursor`.  If unable
   * to be determined, implementations should return `true` to allow
   * for requerying.
   */
  hasNextPage: Scalars["Boolean"];
  /**
   * True if there are more results before `startCursor`.  If unable
   * to be determined, implementations should return `true` to allow
   * for requerying.
   */
  hasPreviousPage: Scalars["Boolean"];
  /**
   * The number of items requested per page.  Allows the storage
   * backend to indicate this when it is responsible for setting a
   * default and the client does not provide it.  Note this may be
   * different to the number of items returned, if there is less than
   * 1 page of results.
   */
  pageLimit?: Maybe<Scalars["Int"]>;
  /**
   * Cursor pointing to the first of the results returned, to be
   * used with `before` query parameter if the backend supports
   * reverse pagination.
   */
  startCursor?: Maybe<Scalars["ID"]>;
  /** The total result count, if it can be determined. */
  totalCount?: Maybe<Scalars["Int"]>;
};

/** A natural person. */
export type Person = Agent & {
  __typename?: "Person";
  /** bitcoin public key, encoded by zenroom */
  bitcoinPublicKey?: Maybe<Scalars["String"]>;
  /** ecdh public key, encoded by zenroom */
  ecdhPublicKey?: Maybe<Scalars["String"]>;
  /** eddsa public key, encoded by zenroom */
  eddsaPublicKey?: Maybe<Scalars["String"]>;
  /** Email address of the agent.  Implies uniqueness. */
  email: Scalars["String"];
  /** ethereum address, encoded by zenroom */
  ethereumAddress?: Maybe<Scalars["String"]>;
  id: Scalars["ID"];
  /** The image files relevant to the agent, such as a logo, avatar, photo, etc. */
  images?: Maybe<Array<File>>;
  /** The name that this agent will be referred to by. */
  name: Scalars["String"];
  /** A textual description or comment. */
  note?: Maybe<Scalars["String"]>;
  /**
   * The main place an agent is located, often an address where activities
   * occur and mail can be sent.	 This is usually a mappable geographic
   * location.  It also could be a website address, as in the case of agents
   * who have no physical location.
   */
  primaryLocation?: Maybe<SpatialThing>;
  /** reflow public key, encoded by zenroom */
  reflowPublicKey?: Maybe<Scalars["String"]>;
  /** Username of the agent.  Implies uniqueness. */
  user: Scalars["String"];
};

export type PersonConnection = {
  __typename?: "PersonConnection";
  edges: Array<PersonEdge>;
  pageInfo: PageInfo;
};

export type PersonCreateParams = {
  /** bitcoin public key, encoded by zenroom */
  bitcoinPublicKey?: InputMaybe<Scalars["String"]>;
  /** ecdh public key, encoded by zenroom */
  ecdhPublicKey?: InputMaybe<Scalars["String"]>;
  /** eddsa public key, encoded by zenroom */
  eddsaPublicKey?: InputMaybe<Scalars["String"]>;
  /** Email address of the agent.  Implies uniqueness. */
  email: Scalars["String"];
  /** ethereum address, encoded by zenroom */
  ethereumAddress?: InputMaybe<Scalars["String"]>;
  /** The image files relevant to the agent, such as a logo, avatar, photo, etc. */
  images?: InputMaybe<Array<IFile>>;
  /** The name that this agent will be referred to by. */
  name: Scalars["String"];
  /** A textual description or comment. */
  note?: InputMaybe<Scalars["String"]>;
  /**
   * (`SpatialThing`) The main place an agent is located, often an address where activities
   * occur and mail can be sent.	 This is usually a mappable geographic
   * location.  It also could be a website address, as in the case of agents
   * who have no physical location.
   */
  primaryLocation?: InputMaybe<Scalars["ID"]>;
  /** reflow public key, encoded by zenroom */
  reflowPublicKey?: InputMaybe<Scalars["String"]>;
  /** Username of the agent.  Implies uniqueness. */
  user: Scalars["String"];
};

export type PersonEdge = {
  __typename?: "PersonEdge";
  cursor: Scalars["ID"];
  node: Person;
};

export type PersonFilterParams = {
  name?: InputMaybe<Scalars["String"]>;
  user?: InputMaybe<Scalars["String"]>;
  userOrName?: InputMaybe<Scalars["String"]>;
};

export type PersonResponse = {
  __typename?: "PersonResponse";
  agent: Person;
};

export type PersonUpdateParams = {
  id: Scalars["ID"];
  /** The name that this agent will be referred to by. */
  name?: InputMaybe<Scalars["String"]>;
  /** A textual description or comment. */
  note?: InputMaybe<Scalars["String"]>;
  /**
   * (`SpatialThing`) The main place an agent is located, often an address where activities
   * occur and mail can be sent.	 This is usually a mappable geographic
   * location.  It also could be a website address, as in the case of agents
   * who have no physical location.
   */
  primaryLocation?: InputMaybe<Scalars["ID"]>;
  /** Username of the agent.  Implies uniqueness. */
  user?: InputMaybe<Scalars["String"]>;
};

/**
 * A logical collection of processes that constitute a body of planned work
 * with defined deliverable(s).
 */
export type Plan = {
  __typename?: "Plan";
  /** The time the plan was made. */
  created: Scalars["DateTime"];
  /** The plan is able to be deleted or not. */
  deletable: Scalars["Boolean"];
  /** The time the plan is expected to be complete. */
  due?: Maybe<Scalars["DateTime"]>;
  id: Scalars["ID"];
  /**
   * An informal or formal textual identifier for a plan.  Does not imply
   * uniqueness.
   */
  name: Scalars["String"];
  /** A textual description or comment. */
  note?: Maybe<Scalars["String"]>;
  /** This plan refines a scenario, making it operational. */
  refinementOf?: Maybe<Scenario>;
};

export type PlanConnection = {
  __typename?: "PlanConnection";
  edges: Array<PlanEdge>;
  pageInfo: PageInfo;
};

export type PlanCreateParams = {
  /** The time the plan is expected to be complete. */
  due?: InputMaybe<Scalars["DateTime"]>;
  /**
   * An informal or formal textual identifier for a plan.  Does not imply
   * uniqueness.
   */
  name: Scalars["String"];
  /** A textual description or comment. */
  note?: InputMaybe<Scalars["String"]>;
  /** (`Scenario`) This plan refines a scenario, making it operational. */
  refinementOf?: InputMaybe<Scalars["ID"]>;
};

export type PlanEdge = {
  __typename?: "PlanEdge";
  cursor: Scalars["ID"];
  node: Plan;
};

export type PlanResponse = {
  __typename?: "PlanResponse";
  plan: Plan;
};

export type PlanUpdateParams = {
  /** The time the plan is expected to be complete. */
  due?: InputMaybe<Scalars["DateTime"]>;
  id: Scalars["ID"];
  /**
   * An informal or formal textual identifier for a plan.  Does not imply
   * uniqueness.
   */
  name?: InputMaybe<Scalars["String"]>;
  /** A textual description or comment. */
  note?: InputMaybe<Scalars["String"]>;
  /** (`Scenario`) This plan refines a scenario, making it operational. */
  refinementOf?: InputMaybe<Scalars["ID"]>;
};

/**
 * A logical collection of processes that constitute a body of processned work
 * with defined deliverable(s).
 */
export type Process = {
  __typename?: "Process";
  /** The definition or specification for a process. */
  basedOn?: Maybe<ProcessSpecification>;
  /**
   * References one or more concepts in a common taxonomy or other
   * classification scheme for purposes of categorization or grouping.
   */
  classifiedAs?: Maybe<Array<Scalars["URI"]>>;
  /** The process can be safely deleted, has no dependent information. */
  deletable: Scalars["Boolean"];
  /**
   * The process is complete or not.  This is irrespective of if the original
   * goal has been met, and indicates that no more will be done.
   */
  finished: Scalars["Boolean"];
  /**
   * A ProcessGroup, to which this Process belongs.
   *
   * It also implies that the ProcessGroup to which this Process belongs
   * holds nothing but only Processes.
   */
  groupedIn?: Maybe<ProcessGroup>;
  /** The planned beginning of the process. */
  hasBeginning?: Maybe<Scalars["DateTime"]>;
  /** The planned end of the process. */
  hasEnd?: Maybe<Scalars["DateTime"]>;
  id: Scalars["ID"];
  /**
   * An informal or formal textual identifier for a process.  Does not imply
   * uniqueness.
   */
  name: Scalars["String"];
  /** The process with its inputs and outputs is part of the scenario. */
  nestedIn?: Maybe<Scenario>;
  /** A textual description or comment. */
  note?: Maybe<Scalars["String"]>;
  /** The process with its inputs and outputs is part of the plan. */
  plannedWithin?: Maybe<Plan>;
  previous?: Maybe<Array<EconomicEvent>>;
};

export type ProcessConnection = {
  __typename?: "ProcessConnection";
  edges: Array<ProcessEdge>;
  pageInfo: PageInfo;
};

export type ProcessCreateParams = {
  /** (`ProcesssSpecification`) The definition or specification for a process. */
  basedOn?: InputMaybe<Scalars["ID"]>;
  /**
   * References one or more concepts in a common taxonomy or other
   * classification scheme for purposes of categorization or grouping.
   */
  classifiedAs?: InputMaybe<Array<Scalars["URI"]>>;
  /**
   * The process is complete or not.  This is irrespective of if the original
   * goal has been met, and indicates that no more will be done.
   */
  finished?: InputMaybe<Scalars["Boolean"]>;
  /**
   * (`ProcessGroup`) A ProcessGroup, to which this Process belongs.
   *
   * It also implies that the ProcessGroup to which this Process belongs
   * holds nothing but only Processes.
   */
  groupedIn?: InputMaybe<Scalars["ID"]>;
  /** The planned beginning of the process. */
  hasBeginning?: InputMaybe<Scalars["DateTime"]>;
  /** The planned end of the process. */
  hasEnd?: InputMaybe<Scalars["DateTime"]>;
  /**
   * An informal or formal textual identifier for a process.  Does not imply
   * uniqueness.
   */
  name: Scalars["String"];
  /** (`Scenario`) The process with its inputs and outputs is part of the scenario. */
  nestedIn?: InputMaybe<Scalars["ID"]>;
  /** A textual description or comment. */
  note?: InputMaybe<Scalars["String"]>;
  /** (`Plan`) The process with its inputs and outputs is part of the plan. */
  plannedWithin?: InputMaybe<Scalars["ID"]>;
};

export type ProcessEdge = {
  __typename?: "ProcessEdge";
  cursor: Scalars["ID"];
  node: Process;
};

/** A filesystem-like structure to hold a group of Processes. */
export type ProcessGroup = {
  __typename?: "ProcessGroup";
  /**
   * A ProcessGroup, to which this ProcessGroup belongs.
   *
   * It also implies that the ProcessGroup to which this ProcessGroup
   * belongs holds nothing but only ProcessGroups.
   *
   * A ProcessGroup cannot be in the group of itself.
   */
  groupedIn?: Maybe<ProcessGroup>;
  /**
   * The Processes xor ProgessGroups which this ProcessGroup groups
   * (holds/contains).
   *
   * The resolved data can only be Processes XOR ProcessGroups.
   */
  groups?: Maybe<ProcessOrProcessGroupConnection>;
  id: Scalars["ID"];
  /**
   * An informal or formal textual identifier for a process group.  Does
   * not imply uniqueness.
   */
  name: Scalars["String"];
  /** A textual description or comment. */
  note?: Maybe<Scalars["String"]>;
};

/** A filesystem-like structure to hold a group of Processes. */
export type ProcessGroupGroupsArgs = {
  after?: InputMaybe<Scalars["ID"]>;
  before?: InputMaybe<Scalars["ID"]>;
  first?: InputMaybe<Scalars["Int"]>;
  last?: InputMaybe<Scalars["Int"]>;
};

export type ProcessGroupConnection = {
  __typename?: "ProcessGroupConnection";
  edges: Array<ProcessGroupEdge>;
  pageInfo: PageInfo;
};

export type ProcessGroupCreateParams = {
  /**
   * (`ProcessGroup`) A ProcessGroup, to which this ProcessGroup belongs.
   *
   * It also implies that the ProcessGroup to which this ProcessGroup
   * belongs holds nothing but only ProcessGroups.
   *
   * A ProcessGroup cannot be in the group of itself.
   */
  groupedIn?: InputMaybe<Scalars["ID"]>;
  /**
   * An informal or formal textual identifier for a process group.  Does
   * not imply uniqueness.
   */
  name: Scalars["String"];
  /** A textual description or comment. */
  note?: InputMaybe<Scalars["String"]>;
};

export type ProcessGroupEdge = {
  __typename?: "ProcessGroupEdge";
  cursor: Scalars["ID"];
  node: ProcessGroup;
};

export type ProcessGroupResponse = {
  __typename?: "ProcessGroupResponse";
  processGroup: ProcessGroup;
};

export type ProcessGroupUpdateParams = {
  /**
   * (`ProcessGroup`) A ProcessGroup, to which this ProcessGroup belongs.
   *
   * It also implies that the ProcessGroup to which this ProcessGroup
   * belongs holds nothing but only ProcessGroups.
   *
   * A ProcessGroup cannot be in the group of itself.
   */
  groupedIn?: InputMaybe<Scalars["ID"]>;
  id: Scalars["ID"];
  /**
   * An informal or formal textual identifier for a process group.  Does
   * not imply uniqueness.
   */
  name?: InputMaybe<Scalars["String"]>;
  /** A textual description or comment. */
  note?: InputMaybe<Scalars["String"]>;
};

export type ProcessOrProcessGroup = Process | ProcessGroup;

export type ProcessOrProcessGroupConnection = {
  __typename?: "ProcessOrProcessGroupConnection";
  edges: Array<ProcessOrProcessGroupEdge>;
  pageInfo: PageInfo;
};

export type ProcessOrProcessGroupEdge = {
  __typename?: "ProcessOrProcessGroupEdge";
  cursor: Scalars["ID"];
  node: ProcessOrProcessGroup;
};

export type ProcessResponse = {
  __typename?: "ProcessResponse";
  process: Process;
};

/** Specifies the kind of process. */
export type ProcessSpecification = {
  __typename?: "ProcessSpecification";
  id: Scalars["ID"];
  /**
   * An informal or formal textual identifier for the process.  Does not
   * imply uniqueness.
   */
  name: Scalars["String"];
  /** A textual description or comment. */
  note?: Maybe<Scalars["String"]>;
};

export type ProcessSpecificationConnection = {
  __typename?: "ProcessSpecificationConnection";
  edges: Array<ProcessSpecificationEdge>;
  pageInfo: PageInfo;
};

export type ProcessSpecificationCreateParams = {
  /**
   * An informal or formal textual identifier for the process.  Does not
   * imply uniqueness.
   */
  name: Scalars["String"];
  /** A textual description or comment. */
  note?: InputMaybe<Scalars["String"]>;
};

export type ProcessSpecificationEdge = {
  __typename?: "ProcessSpecificationEdge";
  cursor: Scalars["ID"];
  node: ProcessSpecification;
};

export type ProcessSpecificationResponse = {
  __typename?: "ProcessSpecificationResponse";
  processSpecification: ProcessSpecification;
};

export type ProcessSpecificationUpdateParams = {
  id: Scalars["ID"];
  /**
   * An informal or formal textual identifier for the process.  Does not
   * imply uniqueness.
   */
  name?: InputMaybe<Scalars["String"]>;
  /** A textual description or comment. */
  note?: InputMaybe<Scalars["String"]>;
};

export type ProcessUpdateParams = {
  /** (`ProcesssSpecification`) The definition or specification for a process. */
  basedOn?: InputMaybe<Scalars["ID"]>;
  /**
   * References one or more concepts in a common taxonomy or other
   * classification scheme for purposes of categorization or grouping.
   */
  classifiedAs?: InputMaybe<Array<Scalars["URI"]>>;
  /**
   * The process is complete or not.  This is irrespective of if the original
   * goal has been met, and indicates that no more will be done.
   */
  finished?: InputMaybe<Scalars["Boolean"]>;
  /**
   * (`ProcessGroup`) A ProcessGroup, to which this Process belongs.
   *
   * It also implies that the ProcessGroup to which this Process belongs
   * holds nothing but only Processes.
   */
  groupedIn?: InputMaybe<Scalars["ID"]>;
  /** The planned beginning of the process. */
  hasBeginning?: InputMaybe<Scalars["DateTime"]>;
  /** The planned end of the process. */
  hasEnd?: InputMaybe<Scalars["DateTime"]>;
  id: Scalars["ID"];
  /**
   * An informal or formal textual identifier for a process.  Does not imply
   * uniqueness.
   */
  name?: InputMaybe<Scalars["String"]>;
  /** (`Scenario`) The process with its inputs and outputs is part of the scenario. */
  nestedIn?: InputMaybe<Scalars["ID"]>;
  /** A textual description or comment. */
  note?: InputMaybe<Scalars["String"]>;
  /** (`Plan`) The process with its inputs and outputs is part of the plan. */
  plannedWithin?: InputMaybe<Scalars["ID"]>;
};

/**
 * A lot or batch, defining a resource produced at the same
 * time in the same way.  From DataFoodConsortium vocabulary
 * https://datafoodconsortium.gitbook.io/dfc-standard-documentation/.
 */
export type ProductBatch = {
  __typename?: "ProductBatch";
  /**
   * An informal or formal textual identifier for a recipe exchange.  Does not
   * imply uniqueness.
   */
  batchNumber: Scalars["String"];
  /** A textual description or comment. */
  expiryDate?: Maybe<Scalars["DateTime"]>;
  id: Scalars["ID"];
  productionDate?: Maybe<Scalars["DateTime"]>;
};

export type ProductBatchConnection = {
  __typename?: "ProductBatchConnection";
  edges: Array<ProductBatchEdge>;
  pageInfo: PageInfo;
};

export type ProductBatchCreateParams = {
  /**
   * An informal or formal textual identifier for a recipe exchange.  Does not
   * imply uniqueness.
   */
  batchNumber: Scalars["String"];
  /** A textual description or comment. */
  expiryDate?: InputMaybe<Scalars["DateTime"]>;
  productionDate?: InputMaybe<Scalars["DateTime"]>;
};

export type ProductBatchEdge = {
  __typename?: "ProductBatchEdge";
  cursor: Scalars["ID"];
  node: ProductBatch;
};

export type ProductBatchResponse = {
  __typename?: "ProductBatchResponse";
  productBatch: ProductBatch;
};

export type ProductBatchUpdateParams = {
  /**
   * An informal or formal textual identifier for a recipe exchange.  Does not
   * imply uniqueness.
   */
  batchNumber?: InputMaybe<Scalars["String"]>;
  /** A textual description or comment. */
  expiryDate?: InputMaybe<Scalars["DateTime"]>;
  id: Scalars["ID"];
  productionDate?: InputMaybe<Scalars["DateTime"]>;
};

export type ProductionFlowItem = EconomicEvent | EconomicResource | Process;

/** Published requests or offers, sometimes with what is expected in return. */
export type Proposal = {
  __typename?: "Proposal";
  /** The date and time the proposal was created. */
  created: Scalars["DateTime"];
  /** The location at which this proposal is eligible. */
  eligibleLocation?: Maybe<SpatialThing>;
  /** The beginning time of proposal publication. */
  hasBeginning?: Maybe<Scalars["DateTime"]>;
  /** The end time of proposal publication. */
  hasEnd?: Maybe<Scalars["DateTime"]>;
  id: Scalars["ID"];
  /**
   * An informal or formal textual identifier for a proposal.  Does not
   * imply uniqueness.
   */
  name?: Maybe<Scalars["String"]>;
  /** A textual description or comment. */
  note?: Maybe<Scalars["String"]>;
  primaryIntents?: Maybe<Array<Intent>>;
  publishes?: Maybe<Array<ProposedIntent>>;
  reciprocalIntents?: Maybe<Array<Intent>>;
  status: ProposedStatus;
  /**
   * This proposal contains unit based quantities, which can be multiplied to
   * create commitments; commonly seen in a price list or e-commerce.
   */
  unitBased?: Maybe<Scalars["Boolean"]>;
};

export type ProposalConnection = {
  __typename?: "ProposalConnection";
  edges: Array<ProposalEdge>;
  pageInfo: PageInfo;
};

export type ProposalCreateParams = {
  /** (`SpatialThing`) The location at which this proposal is eligible. */
  eligibleLocation?: InputMaybe<Scalars["ID"]>;
  /** The beginning time of proposal publication. */
  hasBeginning?: InputMaybe<Scalars["DateTime"]>;
  /** The end time of proposal publication. */
  hasEnd?: InputMaybe<Scalars["DateTime"]>;
  /**
   * An informal or formal textual identifier for a proposal.  Does not
   * imply uniqueness.
   */
  name?: InputMaybe<Scalars["String"]>;
  /** A textual description or comment. */
  note?: InputMaybe<Scalars["String"]>;
  /**
   * This proposal contains unit based quantities, which can be multiplied to
   * create commitments; commonly seen in a price list or e-commerce.
   */
  unitBased?: InputMaybe<Scalars["Boolean"]>;
};

export type ProposalEdge = {
  __typename?: "ProposalEdge";
  cursor: Scalars["ID"];
  node: Proposal;
};

export type ProposalFilterParams = {
  notStatus?: InputMaybe<ProposedStatus>;
  orPrimaryIntentsResourceInventoriedAsClassifiedAs?: InputMaybe<Array<Scalars["URI"]>>;
  orPrimaryIntentsResourceInventoriedAsConformsTo?: InputMaybe<Array<Scalars["ID"]>>;
  orPrimaryIntentsResourceInventoriedAsId?: InputMaybe<Array<Scalars["ID"]>>;
  orPrimaryIntentsResourceInventoriedAsName?: InputMaybe<Scalars["String"]>;
  orPrimaryIntentsResourceInventoriedAsNote?: InputMaybe<Scalars["String"]>;
  orPrimaryIntentsResourceInventoriedAsPrimaryAccountable?: InputMaybe<Array<Scalars["ID"]>>;
  orStatus?: InputMaybe<ProposedStatus>;
  primaryIntentsResourceInventoriedAsClassifiedAs?: InputMaybe<Array<Scalars["URI"]>>;
  primaryIntentsResourceInventoriedAsConformsTo?: InputMaybe<Array<Scalars["ID"]>>;
  primaryIntentsResourceInventoriedAsId?: InputMaybe<Array<Scalars["ID"]>>;
  primaryIntentsResourceInventoriedAsName?: InputMaybe<Scalars["String"]>;
  primaryIntentsResourceInventoriedAsNote?: InputMaybe<Scalars["String"]>;
  primaryIntentsResourceInventoriedAsPrimaryAccountable?: InputMaybe<Array<Scalars["ID"]>>;
  status?: InputMaybe<ProposedStatus>;
};

export type ProposalResponse = {
  __typename?: "ProposalResponse";
  proposal: Proposal;
};

export type ProposalUpdateParams = {
  /** (`SpatialThing`) The location at which this proposal is eligible. */
  eligibleLocation?: InputMaybe<Scalars["ID"]>;
  /** The beginning time of proposal publication. */
  hasBeginning?: InputMaybe<Scalars["DateTime"]>;
  /** The end time of proposal publication. */
  hasEnd?: InputMaybe<Scalars["DateTime"]>;
  id: Scalars["ID"];
  /**
   * An informal or formal textual identifier for a proposal.  Does not
   * imply uniqueness.
   */
  name?: InputMaybe<Scalars["String"]>;
  /** A textual description or comment. */
  note?: InputMaybe<Scalars["String"]>;
  /**
   * This proposal contains unit based quantities, which can be multiplied to
   * create commitments; commonly seen in a price list or e-commerce.
   */
  unitBased?: InputMaybe<Scalars["Boolean"]>;
};

/**
 * Represents many-to-many relationships between Proposals and Intents,
 * supporting including intents in multiple proposals, as well as a proposal
 * including multiple intents.
 */
export type ProposedIntent = {
  __typename?: "ProposedIntent";
  id: Scalars["ID"];
  /** The published proposal which this intent is part of. */
  publishedIn: Proposal;
  /** The intent which is part of this published proposal. */
  publishes: Intent;
  /**
   * This is a reciprocal intent of this proposal, not primary.  Not meant
   * to be used for intent matching.
   */
  reciprocal: Scalars["Boolean"];
};

export type ProposedIntentResponse = {
  __typename?: "ProposedIntentResponse";
  proposedIntent: ProposedIntent;
};

/** The status of the proposal: pending, accepted, or refused. */
export enum ProposedStatus {
  Accepted = "ACCEPTED",
  Pending = "PENDING",
  Refused = "REFUSED",
}

/** Specifies an exchange agreement as part of a recipe. */
export type RecipeExchange = {
  __typename?: "RecipeExchange";
  id: Scalars["ID"];
  /**
   * An informal or formal textual identifier for a recipe exchange.  Does not
   * imply uniqueness.
   */
  name: Scalars["String"];
  /** A textual description or comment. */
  note?: Maybe<Scalars["String"]>;
};

export type RecipeExchangeConnection = {
  __typename?: "RecipeExchangeConnection";
  edges: Array<RecipeExchangeEdge>;
  pageInfo: PageInfo;
};

export type RecipeExchangeCreateParams = {
  /**
   * An informal or formal textual identifier for a recipe exchange.  Does not
   * imply uniqueness.
   */
  name: Scalars["String"];
  /** A textual description or comment. */
  note?: InputMaybe<Scalars["String"]>;
};

export type RecipeExchangeEdge = {
  __typename?: "RecipeExchangeEdge";
  cursor: Scalars["ID"];
  node: RecipeExchange;
};

export type RecipeExchangeResponse = {
  __typename?: "RecipeExchangeResponse";
  recipeExchange: RecipeExchange;
};

export type RecipeExchangeUpdateParams = {
  id: Scalars["ID"];
  /**
   * An informal or formal textual identifier for a recipe exchange.  Does not
   * imply uniqueness.
   */
  name?: InputMaybe<Scalars["String"]>;
  /** A textual description or comment. */
  note?: InputMaybe<Scalars["String"]>;
};

/**
 * The specification of a resource inflow to, or outflow from,
 * a recipe process.
 */
export type RecipeFlow = {
  __typename?: "RecipeFlow";
  /**
   * Relates a process input or output to a verb, such as consume, produce,
   * work, modify, etc.
   */
  action: Action;
  /**
   * The amount and unit of the work or use or citation effort-based
   * action.  This is often a time duration, but also could be cycle counts
   * or other measures of effort or usefulness.
   */
  effortQuantity?: Maybe<Measure>;
  id: Scalars["ID"];
  /** A textual description or comment. */
  note?: Maybe<Scalars["String"]>;
  /** Relates a flow to its exchange agreement in a recipe. */
  recipeClauseOf?: Maybe<RecipeExchange>;
  /** The resource definition referenced by this flow in the recipe. */
  recipeFlowResource: RecipeResource;
  /** Relates an input flow to its process in a recipe. */
  recipeInputOf?: Maybe<RecipeProcess>;
  /** Relates an output flow to its process in a recipe. */
  recipeOutputOf?: Maybe<RecipeProcess>;
  /** The amount and unit of the economic resource counted or inventoried. */
  resourceQuantity?: Maybe<Measure>;
};

export type RecipeFlowConnection = {
  __typename?: "RecipeFlowConnection";
  edges: Array<RecipeFlowEdge>;
  pageInfo: PageInfo;
};

export type RecipeFlowCreateParams = {
  /**
   * (`Action`) Relates a process input or output to a verb, such as consume, produce,
   * work, modify, etc.
   */
  action: Scalars["String"];
  /**
   * The amount and unit of the work or use or citation effort-based
   * action.  This is often a time duration, but also could be cycle counts
   * or other measures of effort or usefulness.
   */
  effortQuantity?: InputMaybe<IMeasure>;
  /** A textual description or comment. */
  note?: InputMaybe<Scalars["String"]>;
  /** (`RecipeExchange`) Relates a flow to its exchange agreement in a recipe. */
  recipeClauseOf?: InputMaybe<Scalars["ID"]>;
  /** (`RecipeResource`) The resource definition referenced by this flow in the recipe. */
  recipeFlowResource: Scalars["ID"];
  /** (`RecipeProcess`) Relates an input flow to its process in a recipe. */
  recipeInputOf?: InputMaybe<Scalars["ID"]>;
  /** (`RecipeProcess`) Relates an output flow to its process in a recipe. */
  recipeOutputOf?: InputMaybe<Scalars["ID"]>;
  /** The amount and unit of the economic resource counted or inventoried. */
  resourceQuantity?: InputMaybe<IMeasure>;
};

export type RecipeFlowEdge = {
  __typename?: "RecipeFlowEdge";
  cursor: Scalars["ID"];
  node: RecipeFlow;
};

export type RecipeFlowResponse = {
  __typename?: "RecipeFlowResponse";
  recipeFlow: RecipeFlow;
};

export type RecipeFlowUpdateParams = {
  /**
   * (`Action`) Relates a process input or output to a verb, such as consume, produce,
   * work, modify, etc.
   */
  action?: InputMaybe<Scalars["String"]>;
  /**
   * The amount and unit of the work or use or citation effort-based
   * action.  This is often a time duration, but also could be cycle counts
   * or other measures of effort or usefulness.
   */
  effortQuantity?: InputMaybe<IMeasure>;
  id: Scalars["ID"];
  /** A textual description or comment. */
  note?: InputMaybe<Scalars["String"]>;
  /** (`RecipeExchange`) Relates a flow to its exchange agreement in a recipe. */
  recipeClauseOf?: InputMaybe<Scalars["ID"]>;
  /** (`RecipeResource`) The resource definition referenced by this flow in the recipe. */
  recipeFlowResource?: InputMaybe<Scalars["ID"]>;
  /** (`RecipeProcess`) Relates an input flow to its process in a recipe. */
  recipeInputOf?: InputMaybe<Scalars["ID"]>;
  /** (`RecipeProcess`) Relates an output flow to its process in a recipe. */
  recipeOutputOf?: InputMaybe<Scalars["ID"]>;
  /** The amount and unit of the economic resource counted or inventoried. */
  resourceQuantity?: InputMaybe<IMeasure>;
};

/** Specifies a process in a recipe for use in planning from recipe. */
export type RecipeProcess = {
  __typename?: "RecipeProcess";
  /**
   * The planned calendar duration of the process as defined for the recipe
   * batch.
   */
  hasDuration?: Maybe<Duration>;
  id: Scalars["ID"];
  /**
   * An informal or formal textual identifier for a recipe process.  Does not
   * imply uniqueness.
   */
  name: Scalars["String"];
  /** A textual description or comment. */
  note?: Maybe<Scalars["String"]>;
  /**
   * References a concept in a common taxonomy or other classification scheme
   * for purposes of categorization.
   */
  processClassifiedAs?: Maybe<Array<Scalars["URI"]>>;
  /** The standard specification or definition of a process. */
  processConformsTo: ProcessSpecification;
};

export type RecipeProcessConnection = {
  __typename?: "RecipeProcessConnection";
  edges: Array<RecipeProcessEdge>;
  pageInfo: PageInfo;
};

export type RecipeProcessCreateParams = {
  /**
   * The planned calendar duration of the process as defined for the recipe
   * batch.
   */
  hasDuration?: InputMaybe<IDuration>;
  /**
   * An informal or formal textual identifier for a recipe process.  Does not
   * imply uniqueness.
   */
  name: Scalars["String"];
  /** A textual description or comment. */
  note?: InputMaybe<Scalars["String"]>;
  /**
   * References a concept in a common taxonomy or other classification scheme
   * for purposes of categorization.
   */
  processClassifiedAs?: InputMaybe<Array<Scalars["URI"]>>;
  /** (`ProcesssSpecification`) The standard specification or definition of a process. */
  processConformsTo: Scalars["ID"];
};

export type RecipeProcessEdge = {
  __typename?: "RecipeProcessEdge";
  cursor: Scalars["ID"];
  node: RecipeProcess;
};

export type RecipeProcessResponse = {
  __typename?: "RecipeProcessResponse";
  recipeProcess: RecipeProcess;
};

export type RecipeProcessUpdateParams = {
  /**
   * The planned calendar duration of the process as defined for the recipe
   * batch.
   */
  hasDuration?: InputMaybe<IDuration>;
  id: Scalars["ID"];
  /**
   * An informal or formal textual identifier for a recipe process.  Does not
   * imply uniqueness.
   */
  name?: InputMaybe<Scalars["String"]>;
  /** A textual description or comment. */
  note?: InputMaybe<Scalars["String"]>;
  /**
   * References a concept in a common taxonomy or other classification scheme
   * for purposes of categorization.
   */
  processClassifiedAs?: InputMaybe<Array<Scalars["URI"]>>;
  /** (`ProcesssSpecification`) The standard specification or definition of a process. */
  processConformsTo?: InputMaybe<Scalars["ID"]>;
};

/**
 * Specifies the resource as part of a recipe, for use in planning from
 * recipe.
 */
export type RecipeResource = {
  __typename?: "RecipeResource";
  id: Scalars["ID"];
  /** The image files relevant to the entity, such as a photo, diagram, etc. */
  images?: Maybe<Array<File>>;
  /**
   * An informal or formal textual identifier for a recipe resource.  Does not
   * imply uniqueness.
   */
  name: Scalars["String"];
  /** A textual description or comment. */
  note?: Maybe<Scalars["String"]>;
  /**
   * References a concept in a common taxonomy or other classification scheme
   * for purposes of categorization or grouping.
   */
  resourceClassifiedAs?: Maybe<Array<Scalars["URI"]>>;
  /**
   * The primary resource specification or definition of an existing or
   * potential economic resource.  A resource will have only one, as this
   * specifies exactly what the resource is.
   */
  resourceConformsTo?: Maybe<ResourceSpecification>;
  /**
   * Defines if any resource of that type can be freely substituted for any
   * other resource of that type when used, consumed, traded, etc.
   */
  substitutable: Scalars["Boolean"];
  /**
   * The unit used for use action on this resource or work action in the
   * recipe.
   */
  unitOfEffort?: Maybe<Unit>;
  /** The unit of inventory used for this resource in the recipe. */
  unitOfResource?: Maybe<Unit>;
};

export type RecipeResourceConnection = {
  __typename?: "RecipeResourceConnection";
  edges: Array<RecipeResourceEdge>;
  pageInfo: PageInfo;
};

export type RecipeResourceCreateParams = {
  /** The image files relevant to the entity, such as a photo, diagram, etc. */
  images?: InputMaybe<Array<IFile>>;
  /**
   * An informal or formal textual identifier for a recipe resource.  Does not
   * imply uniqueness.
   */
  name: Scalars["String"];
  /** A textual description or comment. */
  note?: InputMaybe<Scalars["String"]>;
  /**
   * References a concept in a common taxonomy or other classification scheme
   * for purposes of categorization or grouping.
   */
  resourceClassifiedAs?: InputMaybe<Array<Scalars["URI"]>>;
  /**
   * (`ResourceSpecification`) The primary resource specification or definition of an existing or
   * potential economic resource.  A resource will have only one, as this
   * specifies exactly what the resource is.
   */
  resourceConformsTo?: InputMaybe<Scalars["ID"]>;
  /**
   * Defines if any resource of that type can be freely substituted for any
   * other resource of that type when used, consumed, traded, etc.
   */
  substitutable?: InputMaybe<Scalars["Boolean"]>;
  /** (`Unit`) The unit of inventory used for this resource in the recipe. */
  unitOfEffort?: InputMaybe<Scalars["ID"]>;
  /** (`Unit`) The unit of inventory used for this resource in the recipe. */
  unitOfResource?: InputMaybe<Scalars["ID"]>;
};

export type RecipeResourceEdge = {
  __typename?: "RecipeResourceEdge";
  cursor: Scalars["ID"];
  node: RecipeResource;
};

export type RecipeResourceResponse = {
  __typename?: "RecipeResourceResponse";
  recipeResource: RecipeResource;
};

export type RecipeResourceUpdateParams = {
  id: Scalars["ID"];
  /** The image files relevant to the entity, such as a photo, diagram, etc. */
  images?: InputMaybe<Array<IFile>>;
  /**
   * An informal or formal textual identifier for a recipe resource.  Does not
   * imply uniqueness.
   */
  name?: InputMaybe<Scalars["String"]>;
  /** A textual description or comment. */
  note?: InputMaybe<Scalars["String"]>;
  /**
   * References a concept in a common taxonomy or other classification scheme
   * for purposes of categorization or grouping.
   */
  resourceClassifiedAs?: InputMaybe<Array<Scalars["URI"]>>;
  /**
   * (`ResourceSpecification`) The primary resource specification or definition of an existing or
   * potential economic resource.  A resource will have only one, as this
   * specifies exactly what the resource is.
   */
  resourceConformsTo?: InputMaybe<Scalars["ID"]>;
  /**
   * Defines if any resource of that type can be freely substituted for any
   * other resource of that type when used, consumed, traded, etc.
   */
  substitutable?: InputMaybe<Scalars["Boolean"]>;
  /** (`Unit`) The unit of inventory used for this resource in the recipe. */
  unitOfEffort?: InputMaybe<Scalars["ID"]>;
  /** (`Unit`) The unit of inventory used for this resource in the recipe. */
  unitOfResource?: InputMaybe<Scalars["ID"]>;
};

/**
 * Specification of a kind of resource.  Could define a material item,
 * service, digital item, currency account, etc.  Used instead of a
 * classification when more information is needed, particularly for recipes.
 */
export type ResourceSpecification = {
  __typename?: "ResourceSpecification";
  /** The default unit used for use or work. */
  defaultUnitOfEffort?: Maybe<Unit>;
  /** The default unit used for the resource itself. */
  defaultUnitOfResource?: Maybe<Unit>;
  id: Scalars["ID"];
  /** The image files relevant to the entity, such as a photo, diagram, etc. */
  images?: Maybe<Array<File>>;
  /**
   * An informal or formal textual identifier for a type of resource.
   * Does not imply uniqueness.
   */
  name: Scalars["String"];
  /** A textual description or comment. */
  note?: Maybe<Scalars["String"]>;
  /**
   * References a concept in a common taxonomy or other classification scheme
   * for purposes of categorization or grouping.
   */
  resourceClassifiedAs?: Maybe<Array<Scalars["URI"]>>;
};

export type ResourceSpecificationConnection = {
  __typename?: "ResourceSpecificationConnection";
  edges: Array<ResourceSpecificationEdge>;
  pageInfo: PageInfo;
};

export type ResourceSpecificationCreateParams = {
  /** (`Unit`) The default unit used for use or work. */
  defaultUnitOfEffort?: InputMaybe<Scalars["ID"]>;
  /** (`Unit`) The default unit used for the resource itself. */
  defaultUnitOfResource?: InputMaybe<Scalars["ID"]>;
  /** The image files relevant to the entity, such as a photo, diagram, etc. */
  images?: InputMaybe<Array<IFile>>;
  /**
   * An informal or formal textual identifier for a type of resource.
   * Does not imply uniqueness.
   */
  name: Scalars["String"];
  /** A textual description or comment. */
  note?: InputMaybe<Scalars["String"]>;
  /**
   * References a concept in a common taxonomy or other classification scheme
   * for purposes of categorization or grouping.
   */
  resourceClassifiedAs?: InputMaybe<Array<Scalars["URI"]>>;
};

export type ResourceSpecificationEdge = {
  __typename?: "ResourceSpecificationEdge";
  cursor: Scalars["ID"];
  node: ResourceSpecification;
};

export type ResourceSpecificationResponse = {
  __typename?: "ResourceSpecificationResponse";
  resourceSpecification: ResourceSpecification;
};

export type ResourceSpecificationUpdateParams = {
  /** (`Unit`) The default unit used for use or work. */
  defaultUnitOfEffort?: InputMaybe<Scalars["ID"]>;
  /** (`Unit`) The default unit used for the resource itself. */
  defaultUnitOfResource?: InputMaybe<Scalars["ID"]>;
  id: Scalars["ID"];
  /**
   * An informal or formal textual identifier for a type of resource.
   * Does not imply uniqueness.
   */
  name?: InputMaybe<Scalars["String"]>;
  /** A textual description or comment. */
  note?: InputMaybe<Scalars["String"]>;
  /**
   * References a concept in a common taxonomy or other classification scheme
   * for purposes of categorization or grouping.
   */
  resourceClassifiedAs?: InputMaybe<Array<Scalars["URI"]>>;
};

/** The general shape or behavior grouping of an agent relationship role. */
export type RoleBehavior = {
  __typename?: "RoleBehavior";
  id: Scalars["ID"];
  /**
   * An informal or formal textual identifier for a role behavior.  Does not
   * imply uniqueness.
   */
  name: Scalars["String"];
  /** A textual description or comment. */
  note?: Maybe<Scalars["String"]>;
};

export type RoleBehaviorConnection = {
  __typename?: "RoleBehaviorConnection";
  edges: Array<RoleBehaviorEdge>;
  pageInfo: PageInfo;
};

export type RoleBehaviorCreateParams = {
  /**
   * An informal or formal textual identifier for a role behavior.  Does not
   * imply uniqueness.
   */
  name: Scalars["String"];
  /** A textual description or comment. */
  note?: InputMaybe<Scalars["String"]>;
};

export type RoleBehaviorEdge = {
  __typename?: "RoleBehaviorEdge";
  cursor: Scalars["ID"];
  node: RoleBehavior;
};

export type RoleBehaviorResponse = {
  __typename?: "RoleBehaviorResponse";
  roleBehavior: RoleBehavior;
};

export type RoleBehaviorUpdateParams = {
  id: Scalars["ID"];
  /**
   * An informal or formal textual identifier for a role behavior.  Does not
   * imply uniqueness.
   */
  name?: InputMaybe<Scalars["String"]>;
  /** A textual description or comment. */
  note?: InputMaybe<Scalars["String"]>;
};

export type RootMutationType = {
  __typename?: "RootMutationType";
  claimPerson: Scalars["JSON"];
  createAgentRelationship: AgentRelationshipResponse;
  createAgentRelationshipRole: AgentRelationshipRoleResponse;
  createAgreement: AgreementResponse;
  createEconomicEvent: EconomicEventResponse;
  createIntent: IntentResponse;
  /**
   * Registers a new organization (group agent) with the
   * collaboration space.
   */
  createOrganization: OrganizationResponse;
  /** Registers a new (human) person with the collaboration space. */
  createPerson: PersonResponse;
  createPlan: PlanResponse;
  createProcess: ProcessResponse;
  createProcessGroup: ProcessGroupResponse;
  createProcessSpecification: ProcessSpecificationResponse;
  createProductBatch: ProductBatchResponse;
  createProposal: ProposalResponse;
  createRecipeExchange: RecipeExchangeResponse;
  createRecipeFlow: RecipeFlowResponse;
  createRecipeProcess: RecipeProcessResponse;
  createRecipeResource: RecipeResourceResponse;
  createResourceSpecification: ResourceSpecificationResponse;
  /** Creates a role behavior. */
  createRoleBehavior: RoleBehaviorResponse;
  createSatisfaction: SatisfactionResponse;
  createScenario: ScenarioResponse;
  createScenarioDefinition: ScenarioDefinitionResponse;
  createSpatialThing: SpatialThingResponse;
  createUnit: UnitResponse;
  deleteAgentRelationship: Scalars["Boolean"];
  deleteAgentRelationshipRole: Scalars["Boolean"];
  deleteAgreement: Scalars["Boolean"];
  deleteEconomicResource: Scalars["Boolean"];
  deleteIntent: Scalars["Boolean"];
  /**
   * Erase record of an organization and thus remove it from
   * the collaboration space.
   */
  deleteOrganization: Scalars["Boolean"];
  /**
   * Erase record of a person and thus remove them from the
   * collaboration space.
   */
  deletePerson: Scalars["Boolean"];
  deletePlan: Scalars["Boolean"];
  deleteProcess: Scalars["Boolean"];
  deleteProcessGroup: Scalars["Boolean"];
  deleteProcessSpecification: Scalars["Boolean"];
  deleteProductBatch: Scalars["Boolean"];
  deleteProposal: Scalars["Boolean"];
  deleteProposedIntent: Scalars["Boolean"];
  deleteRecipeExchange: Scalars["Boolean"];
  deleteRecipeFlow: Scalars["Boolean"];
  deleteRecipeProcess: Scalars["Boolean"];
  deleteRecipeResource: Scalars["Boolean"];
  deleteResourceSpecification: Scalars["Boolean"];
  /** Deletes a role behavior. */
  deleteRoleBehavior: Scalars["Boolean"];
  deleteSatisfaction: Scalars["Boolean"];
  deleteScenario: Scalars["Boolean"];
  deleteScenarioDefinition: Scalars["Boolean"];
  deleteSpatialThing: Scalars["Boolean"];
  deleteUnit: Scalars["Boolean"];
  /** For testing.  Temporary */
  echo: Scalars["String"];
  /** Import repositories from a softwarepassport instance. */
  importRepos?: Maybe<Scalars["String"]>;
  keypairoomServer: Scalars["String"];
  /**
   * Include an existing intent as part of a proposal.
   * @param publishedIn the (`Proposal`) to include the intent in
   * @param publishes the (`Intent`) to include as part of the proposal
   */
  proposeIntent: ProposedIntentResponse;
  updateAgentRelationship: AgentRelationshipResponse;
  updateAgentRelationshipRole: AgentRelationshipRoleResponse;
  updateAgreement: AgreementResponse;
  updateEconomicEvent: EconomicEventResponse;
  updateEconomicResource: EconomicResourceResponse;
  updateIntent: IntentResponse;
  /** Update organization profile details. */
  updateOrganization: OrganizationResponse;
  /** Update profile details. */
  updatePerson: PersonResponse;
  updatePlan: PlanResponse;
  updateProcess: ProcessResponse;
  updateProcessGroup: ProcessGroupResponse;
  updateProcessSpecification: ProcessSpecificationResponse;
  updateProductBatch: ProductBatchResponse;
  updateProposal: ProposalResponse;
  updateRecipeExchange: RecipeExchangeResponse;
  updateRecipeFlow: RecipeFlowResponse;
  updateRecipeProcess: RecipeProcessResponse;
  updateRecipeResource: RecipeResourceResponse;
  updateResourceSpecification: ResourceSpecificationResponse;
  /** Updates a role behavior. */
  updateRoleBehavior: RoleBehaviorResponse;
  updateSatisfaction: SatisfactionResponse;
  updateScenario: ScenarioResponse;
  updateScenarioDefinition: ScenarioDefinitionResponse;
  updateSpatialThing: SpatialThingResponse;
  updateUnit: UnitResponse;
};

export type RootMutationTypeClaimPersonArgs = {
  id: Scalars["ID"];
};

export type RootMutationTypeCreateAgentRelationshipArgs = {
  relationship: AgentRelationshipCreateParams;
};

export type RootMutationTypeCreateAgentRelationshipRoleArgs = {
  agentRelationshipRole: AgentRelationshipRoleCreateParams;
};

export type RootMutationTypeCreateAgreementArgs = {
  agreement: AgreementCreateParams;
};

export type RootMutationTypeCreateEconomicEventArgs = {
  event: EconomicEventCreateParams;
  newInventoriedResource?: InputMaybe<EconomicResourceCreateParams>;
};

export type RootMutationTypeCreateIntentArgs = {
  intent: IntentCreateParams;
};

export type RootMutationTypeCreateOrganizationArgs = {
  organization: OrganizationCreateParams;
};

export type RootMutationTypeCreatePersonArgs = {
  person: PersonCreateParams;
};

export type RootMutationTypeCreatePlanArgs = {
  plan: PlanCreateParams;
};

export type RootMutationTypeCreateProcessArgs = {
  process: ProcessCreateParams;
};

export type RootMutationTypeCreateProcessGroupArgs = {
  processGroup: ProcessGroupCreateParams;
};

export type RootMutationTypeCreateProcessSpecificationArgs = {
  processSpecification: ProcessSpecificationCreateParams;
};

export type RootMutationTypeCreateProductBatchArgs = {
  productBatch: ProductBatchCreateParams;
};

export type RootMutationTypeCreateProposalArgs = {
  proposal: ProposalCreateParams;
};

export type RootMutationTypeCreateRecipeExchangeArgs = {
  recipeExchange: RecipeExchangeCreateParams;
};

export type RootMutationTypeCreateRecipeFlowArgs = {
  recipeFlow: RecipeFlowCreateParams;
};

export type RootMutationTypeCreateRecipeProcessArgs = {
  recipeProcess: RecipeProcessCreateParams;
};

export type RootMutationTypeCreateRecipeResourceArgs = {
  recipeResource: RecipeResourceCreateParams;
};

export type RootMutationTypeCreateResourceSpecificationArgs = {
  resourceSpecification: ResourceSpecificationCreateParams;
};

export type RootMutationTypeCreateRoleBehaviorArgs = {
  roleBehavior: RoleBehaviorCreateParams;
};

export type RootMutationTypeCreateSatisfactionArgs = {
  satisfaction: SatisfactionCreateParams;
};

export type RootMutationTypeCreateScenarioArgs = {
  scenario: ScenarioCreateParams;
};

export type RootMutationTypeCreateScenarioDefinitionArgs = {
  scenarioDefinition: ScenarioDefinitionCreateParams;
};

export type RootMutationTypeCreateSpatialThingArgs = {
  spatialThing: SpatialThingCreateParams;
};

export type RootMutationTypeCreateUnitArgs = {
  unit: UnitCreateParams;
};

export type RootMutationTypeDeleteAgentRelationshipArgs = {
  id: Scalars["ID"];
};

export type RootMutationTypeDeleteAgentRelationshipRoleArgs = {
  id: Scalars["ID"];
};

export type RootMutationTypeDeleteAgreementArgs = {
  id: Scalars["ID"];
};

export type RootMutationTypeDeleteEconomicResourceArgs = {
  id: Scalars["ID"];
};

export type RootMutationTypeDeleteIntentArgs = {
  id: Scalars["ID"];
};

export type RootMutationTypeDeleteOrganizationArgs = {
  id: Scalars["ID"];
};

export type RootMutationTypeDeletePersonArgs = {
  id: Scalars["ID"];
};

export type RootMutationTypeDeletePlanArgs = {
  id: Scalars["ID"];
};

export type RootMutationTypeDeleteProcessArgs = {
  id: Scalars["ID"];
};

export type RootMutationTypeDeleteProcessGroupArgs = {
  id: Scalars["ID"];
};

export type RootMutationTypeDeleteProcessSpecificationArgs = {
  id: Scalars["ID"];
};

export type RootMutationTypeDeleteProductBatchArgs = {
  id: Scalars["ID"];
};

export type RootMutationTypeDeleteProposalArgs = {
  id: Scalars["ID"];
};

export type RootMutationTypeDeleteProposedIntentArgs = {
  id: Scalars["ID"];
};

export type RootMutationTypeDeleteRecipeExchangeArgs = {
  id: Scalars["ID"];
};

export type RootMutationTypeDeleteRecipeFlowArgs = {
  id: Scalars["ID"];
};

export type RootMutationTypeDeleteRecipeProcessArgs = {
  id: Scalars["ID"];
};

export type RootMutationTypeDeleteRecipeResourceArgs = {
  id: Scalars["ID"];
};

export type RootMutationTypeDeleteResourceSpecificationArgs = {
  id: Scalars["ID"];
};

export type RootMutationTypeDeleteRoleBehaviorArgs = {
  id: Scalars["ID"];
};

export type RootMutationTypeDeleteSatisfactionArgs = {
  id: Scalars["ID"];
};

export type RootMutationTypeDeleteScenarioArgs = {
  id: Scalars["ID"];
};

export type RootMutationTypeDeleteScenarioDefinitionArgs = {
  id: Scalars["ID"];
};

export type RootMutationTypeDeleteSpatialThingArgs = {
  id: Scalars["ID"];
};

export type RootMutationTypeDeleteUnitArgs = {
  id: Scalars["ID"];
};

export type RootMutationTypeEchoArgs = {
  arg: Scalars["String"];
};

export type RootMutationTypeImportReposArgs = {
  url: Scalars["String"];
};

export type RootMutationTypeKeypairoomServerArgs = {
  firstRegistration: Scalars["Boolean"];
  userData: Scalars["String"];
};

export type RootMutationTypeProposeIntentArgs = {
  publishedIn: Scalars["ID"];
  publishes: Scalars["ID"];
  reciprocal?: InputMaybe<Scalars["Boolean"]>;
};

export type RootMutationTypeUpdateAgentRelationshipArgs = {
  relationship: AgentRelationshipUpdateParams;
};

export type RootMutationTypeUpdateAgentRelationshipRoleArgs = {
  agentRelationshipRole: AgentRelationshipRoleUpdateParams;
};

export type RootMutationTypeUpdateAgreementArgs = {
  agreement: AgreementUpdateParams;
};

export type RootMutationTypeUpdateEconomicEventArgs = {
  event: EconomicEventUpdateParams;
};

export type RootMutationTypeUpdateEconomicResourceArgs = {
  resource: EconomicResourceUpdateParams;
};

export type RootMutationTypeUpdateIntentArgs = {
  intent: IntentUpdateParams;
};

export type RootMutationTypeUpdateOrganizationArgs = {
  organization: OrganizationUpdateParams;
};

export type RootMutationTypeUpdatePersonArgs = {
  person: PersonUpdateParams;
};

export type RootMutationTypeUpdatePlanArgs = {
  plan: PlanUpdateParams;
};

export type RootMutationTypeUpdateProcessArgs = {
  process: ProcessUpdateParams;
};

export type RootMutationTypeUpdateProcessGroupArgs = {
  processGroup: ProcessGroupUpdateParams;
};

export type RootMutationTypeUpdateProcessSpecificationArgs = {
  processSpecification: ProcessSpecificationUpdateParams;
};

export type RootMutationTypeUpdateProductBatchArgs = {
  productBatch: ProductBatchUpdateParams;
};

export type RootMutationTypeUpdateProposalArgs = {
  proposal: ProposalUpdateParams;
};

export type RootMutationTypeUpdateRecipeExchangeArgs = {
  recipeExchange: RecipeExchangeUpdateParams;
};

export type RootMutationTypeUpdateRecipeFlowArgs = {
  recipeFlow: RecipeFlowUpdateParams;
};

export type RootMutationTypeUpdateRecipeProcessArgs = {
  recipeProcess: RecipeProcessUpdateParams;
};

export type RootMutationTypeUpdateRecipeResourceArgs = {
  recipeResource: RecipeResourceUpdateParams;
};

export type RootMutationTypeUpdateResourceSpecificationArgs = {
  resourceSpecification: ResourceSpecificationUpdateParams;
};

export type RootMutationTypeUpdateRoleBehaviorArgs = {
  roleBehavior: RoleBehaviorUpdateParams;
};

export type RootMutationTypeUpdateSatisfactionArgs = {
  satisfaction: SatisfactionUpdateParams;
};

export type RootMutationTypeUpdateScenarioArgs = {
  scenario: ScenarioUpdateParams;
};

export type RootMutationTypeUpdateScenarioDefinitionArgs = {
  scenarioDefinition: ScenarioDefinitionUpdateParams;
};

export type RootMutationTypeUpdateSpatialThingArgs = {
  spatialThing: SpatialThingUpdateParams;
};

export type RootMutationTypeUpdateUnitArgs = {
  unit: UnitUpdateParams;
};

export type RootQueryType = {
  __typename?: "RootQueryType";
  /** Find an agent (person or organization) by their ID. */
  agent?: Maybe<Agent>;
  /** Retrieve details of an agent relationship by its ID. */
  agentRelationship?: Maybe<AgentRelationship>;
  /** Retrieve details of an agent relationship role by its ID. */
  agentRelationshipRole?: Maybe<AgentRelationshipRole>;
  /**
   * Retrieve possible kinds of associations that agents may have
   * with one another in this collaboration space.
   */
  agentRelationshipRoles?: Maybe<AgentRelationshipRoleConnection>;
  /**
   * Retrieve details of all the relationships between all agents
   * registered in this collaboration space.
   */
  agentRelationships?: Maybe<AgentRelationshipConnection>;
  /**
   * Loads all agents publicly registered within this collaboration
   * space.
   */
  agents?: Maybe<AgentConnection>;
  agreement?: Maybe<Agreement>;
  agreements?: Maybe<AgreementConnection>;
  /** For testing.  Temporary */
  echo: Scalars["String"];
  economicEvent?: Maybe<EconomicEvent>;
  economicEvents?: Maybe<EconomicEventConnection>;
  economicResource?: Maybe<EconomicResource>;
  economicResourceClassifications?: Maybe<Array<Scalars["URI"]>>;
  economicResources?: Maybe<EconomicResourceConnection>;
  instanceVariables: InstanceVariables;
  intent?: Maybe<Intent>;
  intents: IntentConnection;
  /** Loads details of the currently authenticated agent. */
  myAgent?: Maybe<Agent>;
  /** List all proposals that are being listed as offers. */
  offers: ProposalConnection;
  /** Find an organization (group) agent by its ID. */
  organization?: Maybe<Organization>;
  /**
   * Loads all organizations publicly registered within this
   * collaboration space.
   */
  organizations?: Maybe<OrganizationConnection>;
  /**
   * Loads all people who have publicly registered with this collaboration
   * space.
   */
  people?: Maybe<PersonConnection>;
  /** Find a person by their ID. */
  person?: Maybe<Person>;
  /** If exists, find a person by email and eddsa-public-key. */
  personCheck: Person;
  /** Check if a person exists by email xor username. */
  personExists: Scalars["Boolean"];
  /** Retrieve a Person's public key by its id. */
  personPubkey: Scalars["String"];
  plan?: Maybe<Plan>;
  plans?: Maybe<PlanConnection>;
  process?: Maybe<Process>;
  processGroup?: Maybe<ProcessGroup>;
  processGroups?: Maybe<ProcessGroupConnection>;
  processSpecification?: Maybe<ProcessSpecification>;
  processSpecifications: ProcessSpecificationConnection;
  processes?: Maybe<ProcessConnection>;
  productBatch?: Maybe<ProductBatch>;
  productBatches?: Maybe<ProductBatchConnection>;
  /** List all the agents associated in a project. */
  projectAgents?: Maybe<Array<Maybe<Agent>>>;
  proposal?: Maybe<Proposal>;
  proposals: ProposalConnection;
  recipeExchange?: Maybe<RecipeExchange>;
  recipeExchanges?: Maybe<RecipeExchangeConnection>;
  recipeFlow?: Maybe<RecipeFlow>;
  recipeFlows?: Maybe<RecipeFlowConnection>;
  recipeProcess?: Maybe<RecipeProcess>;
  recipeProcesses?: Maybe<RecipeProcessConnection>;
  recipeResource?: Maybe<RecipeResource>;
  recipeResources?: Maybe<RecipeResourceConnection>;
  /** List all proposals that are being listed as requests. */
  requests: ProposalConnection;
  resourceSpecification?: Maybe<ResourceSpecification>;
  resourceSpecifications?: Maybe<ResourceSpecificationConnection>;
  roleBehavior?: Maybe<RoleBehavior>;
  roleBehaviors?: Maybe<RoleBehaviorConnection>;
  satisfaction?: Maybe<Satisfaction>;
  satisfactions: SatisfactionConnection;
  scenario?: Maybe<Scenario>;
  scenarioDefinition?: Maybe<ScenarioDefinition>;
  scenarioDefinitions?: Maybe<ScenarioDefinitionConnection>;
  scenarios?: Maybe<ScenarioConnection>;
  spatialThing?: Maybe<SpatialThing>;
  spatialThings?: Maybe<SpatialThingConnection>;
  unit?: Maybe<Unit>;
  units?: Maybe<UnitConnection>;
};

export type RootQueryTypeAgentArgs = {
  id: Scalars["ID"];
};

export type RootQueryTypeAgentRelationshipArgs = {
  id: Scalars["ID"];
};

export type RootQueryTypeAgentRelationshipRoleArgs = {
  id: Scalars["ID"];
};

export type RootQueryTypeAgentRelationshipRolesArgs = {
  after?: InputMaybe<Scalars["ID"]>;
  before?: InputMaybe<Scalars["ID"]>;
  first?: InputMaybe<Scalars["Int"]>;
  last?: InputMaybe<Scalars["Int"]>;
};

export type RootQueryTypeAgentRelationshipsArgs = {
  after?: InputMaybe<Scalars["ID"]>;
  before?: InputMaybe<Scalars["ID"]>;
  first?: InputMaybe<Scalars["Int"]>;
  last?: InputMaybe<Scalars["Int"]>;
};

export type RootQueryTypeAgentsArgs = {
  after?: InputMaybe<Scalars["ID"]>;
  before?: InputMaybe<Scalars["ID"]>;
  filter?: InputMaybe<AgentFilterParams>;
  first?: InputMaybe<Scalars["Int"]>;
  last?: InputMaybe<Scalars["Int"]>;
};

export type RootQueryTypeAgreementArgs = {
  id: Scalars["ID"];
};

export type RootQueryTypeAgreementsArgs = {
  after?: InputMaybe<Scalars["ID"]>;
  before?: InputMaybe<Scalars["ID"]>;
  first?: InputMaybe<Scalars["Int"]>;
  last?: InputMaybe<Scalars["Int"]>;
};

export type RootQueryTypeEchoArgs = {
  arg: Scalars["String"];
};

export type RootQueryTypeEconomicEventArgs = {
  id: Scalars["ID"];
};

export type RootQueryTypeEconomicEventsArgs = {
  after?: InputMaybe<Scalars["ID"]>;
  before?: InputMaybe<Scalars["ID"]>;
  first?: InputMaybe<Scalars["Int"]>;
  last?: InputMaybe<Scalars["Int"]>;
};

export type RootQueryTypeEconomicResourceArgs = {
  id: Scalars["ID"];
};

export type RootQueryTypeEconomicResourceClassificationsArgs = {
  filter?: InputMaybe<EconomicResourceClassificationsFilterParams>;
};

export type RootQueryTypeEconomicResourcesArgs = {
  after?: InputMaybe<Scalars["ID"]>;
  before?: InputMaybe<Scalars["ID"]>;
  filter?: InputMaybe<EconomicResourceFilterParams>;
  first?: InputMaybe<Scalars["Int"]>;
  last?: InputMaybe<Scalars["Int"]>;
};

export type RootQueryTypeIntentArgs = {
  id: Scalars["ID"];
};

export type RootQueryTypeIntentsArgs = {
  after?: InputMaybe<Scalars["ID"]>;
  before?: InputMaybe<Scalars["ID"]>;
  first?: InputMaybe<Scalars["Int"]>;
  last?: InputMaybe<Scalars["Int"]>;
};

export type RootQueryTypeOffersArgs = {
  after?: InputMaybe<Scalars["ID"]>;
  before?: InputMaybe<Scalars["ID"]>;
  first?: InputMaybe<Scalars["Int"]>;
  last?: InputMaybe<Scalars["Int"]>;
};

export type RootQueryTypeOrganizationArgs = {
  id: Scalars["ID"];
};

export type RootQueryTypeOrganizationsArgs = {
  after?: InputMaybe<Scalars["ID"]>;
  before?: InputMaybe<Scalars["ID"]>;
  filter?: InputMaybe<OrganizationFilterParams>;
  first?: InputMaybe<Scalars["Int"]>;
  last?: InputMaybe<Scalars["Int"]>;
};

export type RootQueryTypePeopleArgs = {
  after?: InputMaybe<Scalars["ID"]>;
  before?: InputMaybe<Scalars["ID"]>;
  filter?: InputMaybe<PersonFilterParams>;
  first?: InputMaybe<Scalars["Int"]>;
  last?: InputMaybe<Scalars["Int"]>;
};

export type RootQueryTypePersonArgs = {
  id: Scalars["ID"];
};

export type RootQueryTypePersonCheckArgs = {
  eddsaPublicKey: Scalars["String"];
  email: Scalars["String"];
};

export type RootQueryTypePersonExistsArgs = {
  email?: InputMaybe<Scalars["String"]>;
  user?: InputMaybe<Scalars["String"]>;
};

export type RootQueryTypePersonPubkeyArgs = {
  id: Scalars["ID"];
};

export type RootQueryTypePlanArgs = {
  id: Scalars["ID"];
};

export type RootQueryTypePlansArgs = {
  after?: InputMaybe<Scalars["ID"]>;
  before?: InputMaybe<Scalars["ID"]>;
  first?: InputMaybe<Scalars["Int"]>;
  last?: InputMaybe<Scalars["Int"]>;
};

export type RootQueryTypeProcessArgs = {
  id: Scalars["ID"];
};

export type RootQueryTypeProcessGroupArgs = {
  id: Scalars["ID"];
};

export type RootQueryTypeProcessGroupsArgs = {
  after?: InputMaybe<Scalars["ID"]>;
  before?: InputMaybe<Scalars["ID"]>;
  first?: InputMaybe<Scalars["Int"]>;
  last?: InputMaybe<Scalars["Int"]>;
};

export type RootQueryTypeProcessSpecificationArgs = {
  id: Scalars["ID"];
};

export type RootQueryTypeProcessSpecificationsArgs = {
  after?: InputMaybe<Scalars["ID"]>;
  before?: InputMaybe<Scalars["ID"]>;
  first?: InputMaybe<Scalars["Int"]>;
  last?: InputMaybe<Scalars["Int"]>;
};

export type RootQueryTypeProcessesArgs = {
  after?: InputMaybe<Scalars["ID"]>;
  before?: InputMaybe<Scalars["ID"]>;
  first?: InputMaybe<Scalars["Int"]>;
  last?: InputMaybe<Scalars["Int"]>;
};

export type RootQueryTypeProductBatchArgs = {
  id: Scalars["ID"];
};

export type RootQueryTypeProductBatchesArgs = {
  after?: InputMaybe<Scalars["ID"]>;
  before?: InputMaybe<Scalars["ID"]>;
  first?: InputMaybe<Scalars["Int"]>;
  last?: InputMaybe<Scalars["Int"]>;
};

export type RootQueryTypeProjectAgentsArgs = {
  url: Scalars["String"];
};

export type RootQueryTypeProposalArgs = {
  id: Scalars["ID"];
};

export type RootQueryTypeProposalsArgs = {
  after?: InputMaybe<Scalars["ID"]>;
  before?: InputMaybe<Scalars["ID"]>;
  filter?: InputMaybe<ProposalFilterParams>;
  first?: InputMaybe<Scalars["Int"]>;
  last?: InputMaybe<Scalars["Int"]>;
};

export type RootQueryTypeRecipeExchangeArgs = {
  id: Scalars["ID"];
};

export type RootQueryTypeRecipeExchangesArgs = {
  after?: InputMaybe<Scalars["ID"]>;
  before?: InputMaybe<Scalars["ID"]>;
  first?: InputMaybe<Scalars["Int"]>;
  last?: InputMaybe<Scalars["Int"]>;
};

export type RootQueryTypeRecipeFlowArgs = {
  id: Scalars["ID"];
};

export type RootQueryTypeRecipeFlowsArgs = {
  after?: InputMaybe<Scalars["ID"]>;
  before?: InputMaybe<Scalars["ID"]>;
  first?: InputMaybe<Scalars["Int"]>;
  last?: InputMaybe<Scalars["Int"]>;
};

export type RootQueryTypeRecipeProcessArgs = {
  id: Scalars["ID"];
};

export type RootQueryTypeRecipeProcessesArgs = {
  after?: InputMaybe<Scalars["ID"]>;
  before?: InputMaybe<Scalars["ID"]>;
  first?: InputMaybe<Scalars["Int"]>;
  last?: InputMaybe<Scalars["Int"]>;
};

export type RootQueryTypeRecipeResourceArgs = {
  id: Scalars["ID"];
};

export type RootQueryTypeRecipeResourcesArgs = {
  after?: InputMaybe<Scalars["ID"]>;
  before?: InputMaybe<Scalars["ID"]>;
  first?: InputMaybe<Scalars["Int"]>;
  last?: InputMaybe<Scalars["Int"]>;
};

export type RootQueryTypeRequestsArgs = {
  after?: InputMaybe<Scalars["ID"]>;
  before?: InputMaybe<Scalars["ID"]>;
  first?: InputMaybe<Scalars["Int"]>;
  last?: InputMaybe<Scalars["Int"]>;
};

export type RootQueryTypeResourceSpecificationArgs = {
  id: Scalars["ID"];
};

export type RootQueryTypeResourceSpecificationsArgs = {
  after?: InputMaybe<Scalars["ID"]>;
  before?: InputMaybe<Scalars["ID"]>;
  first?: InputMaybe<Scalars["Int"]>;
  last?: InputMaybe<Scalars["Int"]>;
};

export type RootQueryTypeRoleBehaviorArgs = {
  id: Scalars["ID"];
};

export type RootQueryTypeRoleBehaviorsArgs = {
  after?: InputMaybe<Scalars["ID"]>;
  before?: InputMaybe<Scalars["ID"]>;
  first?: InputMaybe<Scalars["Int"]>;
  last?: InputMaybe<Scalars["Int"]>;
};

export type RootQueryTypeSatisfactionArgs = {
  id: Scalars["ID"];
};

export type RootQueryTypeSatisfactionsArgs = {
  after?: InputMaybe<Scalars["ID"]>;
  before?: InputMaybe<Scalars["ID"]>;
  first?: InputMaybe<Scalars["Int"]>;
  last?: InputMaybe<Scalars["Int"]>;
};

export type RootQueryTypeScenarioArgs = {
  id: Scalars["ID"];
};

export type RootQueryTypeScenarioDefinitionArgs = {
  id: Scalars["ID"];
};

export type RootQueryTypeScenarioDefinitionsArgs = {
  after?: InputMaybe<Scalars["ID"]>;
  before?: InputMaybe<Scalars["ID"]>;
  first?: InputMaybe<Scalars["Int"]>;
  last?: InputMaybe<Scalars["Int"]>;
};

export type RootQueryTypeScenariosArgs = {
  after?: InputMaybe<Scalars["ID"]>;
  before?: InputMaybe<Scalars["ID"]>;
  first?: InputMaybe<Scalars["Int"]>;
  last?: InputMaybe<Scalars["Int"]>;
};

export type RootQueryTypeSpatialThingArgs = {
  id: Scalars["ID"];
};

export type RootQueryTypeSpatialThingsArgs = {
  after?: InputMaybe<Scalars["ID"]>;
  before?: InputMaybe<Scalars["ID"]>;
  first?: InputMaybe<Scalars["Int"]>;
  last?: InputMaybe<Scalars["Int"]>;
};

export type RootQueryTypeUnitArgs = {
  id: Scalars["ID"];
};

export type RootQueryTypeUnitsArgs = {
  after?: InputMaybe<Scalars["ID"]>;
  before?: InputMaybe<Scalars["ID"]>;
  first?: InputMaybe<Scalars["Int"]>;
  last?: InputMaybe<Scalars["Int"]>;
};

/**
 * Represents many-to-many relationships between intents and commitments
 * or events that partially or full satisfy one or more intents.
 */
export type Satisfaction = {
  __typename?: "Satisfaction";
  /**
   * The amount and unit of the work or use or citation effort-based
   * action.  This is often a time duration, but also could be cycle
   * counts or other measures of effort or usefulness.
   */
  effortQuantity?: Maybe<Measure>;
  id: Scalars["ID"];
  /** A textual description or comment. */
  note?: Maybe<Scalars["String"]>;
  /** The amount and unit of the economic resource counted or inventoried. */
  resourceQuantity?: Maybe<Measure>;
  /**
   * An economic event fully or partially satisfying an intent.
   *
   * Mutually exclusive with commitment.
   */
  satisfiedByEvent?: Maybe<EconomicEvent>;
  /** An intent satisfied fully or partially by an economic event or commitment. */
  satisfies: Intent;
};

export type SatisfactionConnection = {
  __typename?: "SatisfactionConnection";
  edges: Array<SatisfactionEdge>;
  pageInfo: PageInfo;
};

export type SatisfactionCreateParams = {
  /**
   * The amount and unit of the work or use or citation effort-based
   * action.  This is often a time duration, but also could be cycle
   * counts or other measures of effort or usefulness.
   */
  effortQuantity?: InputMaybe<IMeasure>;
  /** A textual description or comment. */
  note?: InputMaybe<Scalars["String"]>;
  /** The amount and unit of the economic resource counted or inventoried. */
  resourceQuantity?: InputMaybe<IMeasure>;
  /**
   * (`EconomicEvent`) An economic event fully or partially satisfying an intent.
   *
   * Mutually exclusive with commitment.
   */
  satisfiedByEvent?: InputMaybe<Scalars["ID"]>;
  /** (`Intent`) An intent satisfied fully or partially by an economic event or commitment. */
  satisfies: Scalars["ID"];
};

export type SatisfactionEdge = {
  __typename?: "SatisfactionEdge";
  cursor: Scalars["ID"];
  node: Satisfaction;
};

export type SatisfactionResponse = {
  __typename?: "SatisfactionResponse";
  satisfaction: Satisfaction;
};

export type SatisfactionUpdateParams = {
  /**
   * The amount and unit of the work or use or citation effort-based
   * action.  This is often a time duration, but also could be cycle
   * counts or other measures of effort or usefulness.
   */
  effortQuantity?: InputMaybe<IMeasure>;
  id: Scalars["ID"];
  /** A textual description or comment. */
  note?: InputMaybe<Scalars["String"]>;
  /** The amount and unit of the economic resource counted or inventoried. */
  resourceQuantity?: InputMaybe<IMeasure>;
  /**
   * (`EconomicEvent`) An economic event fully or partially satisfying an intent.
   *
   * Mutually exclusive with commitment.
   */
  satisfiedByEvent?: InputMaybe<Scalars["ID"]>;
  /** (`Intent`) An intent satisfied fully or partially by an economic event or commitment. */
  satisfies?: InputMaybe<Scalars["ID"]>;
};

/**
 * An estimated or analytical logical collection of higher level processes
 * used for budgeting, analysis, plan refinement, etc."
 */
export type Scenario = {
  __typename?: "Scenario";
  /** The scenario definition for this scenario, for example yearly budget. */
  definedAs?: Maybe<ScenarioDefinition>;
  /**
   * The beginning date/time of the scenario, often the beginning of an
   * accounting period.
   */
  hasBeginning?: Maybe<Scalars["DateTime"]>;
  /**
   * The ending date/time of the scenario, often the end of an accounting
   * period.
   */
  hasEnd?: Maybe<Scalars["DateTime"]>;
  id: Scalars["ID"];
  /**
   * An informal or formal textual identifier for a scenario.  Does not
   * imply uniqueness.
   */
  name: Scalars["String"];
  /** A textual description or comment. */
  note?: Maybe<Scalars["String"]>;
  /**
   * This scenario refines another scenario, often as time moves closer or
   * for more detail.
   */
  refinementOf?: Maybe<Scenario>;
};

export type ScenarioConnection = {
  __typename?: "ScenarioConnection";
  edges: Array<ScenarioEdge>;
  pageInfo: PageInfo;
};

export type ScenarioCreateParams = {
  /** (`ScenarioDefinition`) The scenario definition for this scenario, for example yearly budget. */
  definedAs?: InputMaybe<Scalars["ID"]>;
  /**
   * The beginning date/time of the scenario, often the beginning of an
   * accounting period.
   */
  hasBeginning?: InputMaybe<Scalars["DateTime"]>;
  /**
   * The ending date/time of the scenario, often the end of an accounting
   * period.
   */
  hasEnd?: InputMaybe<Scalars["DateTime"]>;
  /**
   * An informal or formal textual identifier for a scenario.  Does not
   * imply uniqueness.
   */
  name: Scalars["String"];
  /** A textual description or comment. */
  note?: InputMaybe<Scalars["String"]>;
  /**
   * (`Scenario`) This scenario refines another scenario, often as time moves closer or
   * for more detail.
   */
  refinementOf?: InputMaybe<Scalars["ID"]>;
};

/** The type definition of one or more scenarios, such as Yearly Budget. */
export type ScenarioDefinition = {
  __typename?: "ScenarioDefinition";
  /**
   * The planned calendar duration of the process as defined for the recipe
   * batch.
   */
  hasDuration?: Maybe<Duration>;
  id: Scalars["ID"];
  /**
   * An informal or formal textual identifier for a scenario definition.
   * Does not imply uniqueness.
   */
  name: Scalars["String"];
  /** A textual description or comment. */
  note?: Maybe<Scalars["String"]>;
};

export type ScenarioDefinitionConnection = {
  __typename?: "ScenarioDefinitionConnection";
  edges: Array<ScenarioDefinitionEdge>;
  pageInfo: PageInfo;
};

export type ScenarioDefinitionCreateParams = {
  /**
   * The planned calendar duration of the process as defined for the recipe
   * batch.
   */
  hasDuration?: InputMaybe<IDuration>;
  /**
   * An informal or formal textual identifier for a scenario definition.
   * Does not imply uniqueness.
   */
  name: Scalars["String"];
  /** A textual description or comment. */
  note?: InputMaybe<Scalars["String"]>;
};

export type ScenarioDefinitionEdge = {
  __typename?: "ScenarioDefinitionEdge";
  cursor: Scalars["ID"];
  node: ScenarioDefinition;
};

export type ScenarioDefinitionResponse = {
  __typename?: "ScenarioDefinitionResponse";
  scenarioDefinition: ScenarioDefinition;
};

export type ScenarioDefinitionUpdateParams = {
  /**
   * The planned calendar duration of the process as defined for the recipe
   * batch.
   */
  hasDuration?: InputMaybe<IDuration>;
  id: Scalars["ID"];
  /**
   * An informal or formal textual identifier for a scenario definition.
   * Does not imply uniqueness.
   */
  name?: InputMaybe<Scalars["String"]>;
  /** A textual description or comment. */
  note?: InputMaybe<Scalars["String"]>;
};

export type ScenarioEdge = {
  __typename?: "ScenarioEdge";
  cursor: Scalars["ID"];
  node: Scenario;
};

export type ScenarioResponse = {
  __typename?: "ScenarioResponse";
  scenario: Scenario;
};

export type ScenarioUpdateParams = {
  /** (`ScenarioDefinition`) The scenario definition for this scenario, for example yearly budget. */
  definedAs?: InputMaybe<Scalars["ID"]>;
  /**
   * The beginning date/time of the scenario, often the beginning of an
   * accounting period.
   */
  hasBeginning?: InputMaybe<Scalars["DateTime"]>;
  /**
   * The ending date/time of the scenario, often the end of an accounting
   * period.
   */
  hasEnd?: InputMaybe<Scalars["DateTime"]>;
  id: Scalars["ID"];
  /**
   * An informal or formal textual identifier for a scenario.  Does not
   * imply uniqueness.
   */
  name?: InputMaybe<Scalars["String"]>;
  /** A textual description or comment. */
  note?: InputMaybe<Scalars["String"]>;
  /**
   * (`Scenario`) This scenario refines another scenario, often as time moves closer or
   * for more detail.
   */
  refinementOf?: InputMaybe<Scalars["ID"]>;
};

/** A physical mappable location. */
export type SpatialThing = {
  __typename?: "SpatialThing";
  /** Altitude. */
  alt?: Maybe<Scalars["Decimal"]>;
  id: Scalars["ID"];
  /** Latitude. */
  lat?: Maybe<Scalars["Decimal"]>;
  /** Longitude. */
  long?: Maybe<Scalars["Decimal"]>;
  /** An address that will be recognized as mappable by mapping software. */
  mappableAddress?: Maybe<Scalars["String"]>;
  /**
   * An informal or formal textual identifier for a location.  Does not
   * imply uniqueness.
   */
  name: Scalars["String"];
  /** A textual description or comment. */
  note?: Maybe<Scalars["String"]>;
};

export type SpatialThingConnection = {
  __typename?: "SpatialThingConnection";
  edges: Array<SpatialThingEdge>;
  pageInfo: PageInfo;
};

export type SpatialThingCreateParams = {
  /** Altitude. */
  alt?: InputMaybe<Scalars["Decimal"]>;
  /** Latitude. */
  lat?: InputMaybe<Scalars["Decimal"]>;
  /** Longitude. */
  long?: InputMaybe<Scalars["Decimal"]>;
  /** An address that will be recognized as mappable by mapping software. */
  mappableAddress?: InputMaybe<Scalars["String"]>;
  /**
   * An informal or formal textual identifier for a location.  Does not
   * imply uniqueness.
   */
  name: Scalars["String"];
  /** A textual description or comment. */
  note?: InputMaybe<Scalars["String"]>;
};

export type SpatialThingEdge = {
  __typename?: "SpatialThingEdge";
  cursor: Scalars["ID"];
  node: SpatialThing;
};

export type SpatialThingResponse = {
  __typename?: "SpatialThingResponse";
  spatialThing: SpatialThing;
};

export type SpatialThingUpdateParams = {
  /** Altitude. */
  alt?: InputMaybe<Scalars["Decimal"]>;
  id: Scalars["ID"];
  /** Latitude. */
  lat?: InputMaybe<Scalars["Decimal"]>;
  /** Longitude. */
  long?: InputMaybe<Scalars["Decimal"]>;
  /** An address that will be recognized as mappable by mapping software. */
  mappableAddress?: InputMaybe<Scalars["String"]>;
  /**
   * An informal or formal textual identifier for a location.  Does not
   * imply uniqueness.
   */
  name?: InputMaybe<Scalars["String"]>;
  /** A textual description or comment. */
  note?: InputMaybe<Scalars["String"]>;
};

/** Defines the unit of time measured in a temporal `Duration`. */
export enum TimeUnit {
  Day = "day",
  Hour = "hour",
  Minute = "minute",
  Month = "month",
  Second = "second",
  Week = "week",
  Year = "year",
}

export type TrackTraceItem = EconomicEvent | EconomicResource | Process;

/**
 * Defines a unit of measurement, along with its display symbol.  From OM2
 * vocabulary.
 */
export type Unit = {
  __typename?: "Unit";
  id: Scalars["ID"];
  /** A human readable label for the unit, can be language specific. */
  label: Scalars["String"];
  /** A standard display symbol for a unit of measure. */
  symbol: Scalars["String"];
};

export type UnitConnection = {
  __typename?: "UnitConnection";
  edges: Array<UnitEdge>;
  pageInfo: PageInfo;
};

export type UnitCreateParams = {
  /** A human readable label for the unit, can be language specific. */
  label: Scalars["String"];
  /** A standard display symbol for a unit of measure. */
  symbol: Scalars["String"];
};

export type UnitEdge = {
  __typename?: "UnitEdge";
  cursor: Scalars["ID"];
  node: Unit;
};

export type UnitResponse = {
  __typename?: "UnitResponse";
  unit: Unit;
};

export type UnitUpdateParams = {
  id: Scalars["ID"];
  /** A human readable label for the unit, can be language specific. */
  label?: InputMaybe<Scalars["String"]>;
  /** A standard display symbol for a unit of measure. */
  symbol?: InputMaybe<Scalars["String"]>;
};

export type SearchProjectQueryVariables = Exact<{
  id: Scalars["ID"];
}>;

export type SearchProjectQuery = {
  __typename?: "RootQueryType";
  economicResource?: {
    __typename?: "EconomicResource";
    id: string;
    name: string;
    images?: Array<{ __typename?: "File"; bin?: any | null; mimeType: string }> | null;
    conformsTo: { __typename?: "ResourceSpecification"; name: string };
    primaryAccountable: { __typename?: "Organization"; name: string } | { __typename?: "Person"; name: string };
  } | null;
};

export type GetTraceQueryVariables = Exact<{
  id: Scalars["ID"];
}>;

export type GetTraceQuery = {
  __typename?: "RootQueryType";
  economicResource?: {
    __typename?: "EconomicResource";
    trace?: Array<
      | { __typename: "EconomicEvent"; hasPointInTime?: any | null }
      | { __typename: "EconomicResource" }
      | { __typename: "Process" }
    > | null;
  } | null;
};

export type SearchProjectsQueryVariables = Exact<{
  last?: InputMaybe<Scalars["Int"]>;
  IDs?: InputMaybe<Array<Scalars["ID"]> | Scalars["ID"]>;
  name?: InputMaybe<Scalars["String"]>;
  conformsTo?: InputMaybe<Array<Scalars["ID"]> | Scalars["ID"]>;
}>;

export type SearchProjectsQuery = {
  __typename?: "RootQueryType";
  economicResources?: {
    __typename?: "EconomicResourceConnection";
    edges: Array<{
      __typename?: "EconomicResourceEdge";
      node: {
        __typename?: "EconomicResource";
        id: string;
        name: string;
        metadata?: any | null;
        conformsTo: { __typename?: "ResourceSpecification"; id: string; name: string };
        primaryAccountable:
          | { __typename?: "Organization"; id: string; name: string }
          | { __typename?: "Person"; id: string; name: string };
        images?: Array<{ __typename?: "File"; hash: any; name: string; mimeType: string; bin?: any | null }> | null;
      };
    }>;
  } | null;
};

export type SearchTagsQueryVariables = Exact<{
  text: Scalars["URI"];
}>;

export type SearchTagsQuery = { __typename?: "RootQueryType"; economicResourceClassifications?: Array<any> | null };

export type SearchPeopleQueryVariables = Exact<{
  filter?: InputMaybe<PersonFilterParams>;
  last?: InputMaybe<Scalars["Int"]>;
}>;

export type SearchPeopleQuery = {
  __typename?: "RootQueryType";
  people?: {
    __typename?: "PersonConnection";
    edges: Array<{
      __typename?: "PersonEdge";
      node: {
        __typename?: "Person";
        id: string;
        name: string;
        user: string;
        note?: string | null;
        primaryLocation?: { __typename?: "SpatialThing"; id: string; name: string } | null;
      };
    }>;
  } | null;
};

export type FetchResourcesQueryVariables = Exact<{
  filter?: InputMaybe<EconomicResourceFilterParams>;
}>;

export type FetchResourcesQuery = {
  __typename?: "RootQueryType";
  economicResources?: {
    __typename?: "EconomicResourceConnection";
    edges: Array<{
      __typename?: "EconomicResourceEdge";
      cursor: string;
      node: { __typename?: "EconomicResource"; id: string; name: string };
    }>;
  } | null;
};

export type GetTagsQueryVariables = Exact<{ [key: string]: never }>;

export type GetTagsQuery = { __typename?: "RootQueryType"; economicResourceClassifications?: Array<any> | null };

export type UpdateUserMutationVariables = Exact<{
  name?: InputMaybe<Scalars["String"]>;
  id: Scalars["ID"];
  note?: InputMaybe<Scalars["String"]>;
  primaryLocation?: InputMaybe<Scalars["ID"]>;
  user?: InputMaybe<Scalars["String"]>;
}>;

export type UpdateUserMutation = {
  __typename?: "RootMutationType";
  updatePerson: {
    __typename?: "PersonResponse";
    agent: {
      __typename?: "Person";
      id: string;
      name: string;
      note?: string | null;
      primaryLocation?: {
        __typename?: "SpatialThing";
        id: string;
        lat?: any | null;
        long?: any | null;
        name: string;
      } | null;
    };
  };
};

export type GetPersonQueryVariables = Exact<{
  id: Scalars["ID"];
}>;

export type GetPersonQuery = {
  __typename?: "RootQueryType";
  person?: {
    __typename?: "Person";
    id: string;
    name: string;
    user: string;
    primaryLocation?: { __typename?: "SpatialThing"; id: string; name: string } | null;
  } | null;
};

export type GetProjectLayoutQueryVariables = Exact<{
  id: Scalars["ID"];
}>;

export type GetProjectLayoutQuery = {
  __typename?: "RootQueryType";
  economicResource?: {
    __typename?: "EconomicResource";
    id: string;
    name: string;
    note?: string | null;
    metadata?: any | null;
    license?: string | null;
    repo?: string | null;
    classifiedAs?: Array<any> | null;
    conformsTo: { __typename?: "ResourceSpecification"; id: string; name: string };
    primaryAccountable:
      | { __typename?: "Organization"; id: string; name: string }
      | { __typename?: "Person"; id: string; name: string };
    currentLocation?: {
      __typename?: "SpatialThing";
      id: string;
      name: string;
      mappableAddress?: string | null;
      lat?: any | null;
      long?: any | null;
    } | null;
    images?: Array<{ __typename?: "File"; hash: any; name: string; mimeType: string; bin?: any | null }> | null;
  } | null;
};

export type GetUserLayoutQueryVariables = Exact<{
  id: Scalars["ID"];
}>;

export type GetUserLayoutQuery = {
  __typename?: "RootQueryType";
  person?: {
    __typename?: "Person";
    id: string;
    name: string;
    note?: string | null;
    email: string;
    user: string;
    ethereumAddress?: string | null;
    primaryLocation?: {
      __typename?: "SpatialThing";
      name: string;
      mappableAddress?: string | null;
      lat?: any | null;
      long?: any | null;
    } | null;
  } | null;
};

export type GetDppQueryVariables = Exact<{
  id: Scalars["ID"];
}>;

export type GetDppQuery = {
  __typename?: "RootQueryType";
  economicResource?: { __typename?: "EconomicResource"; traceDpp: any } | null;
};

export type GetVariablesQueryVariables = Exact<{ [key: string]: never }>;

export type GetVariablesQuery = {
  __typename?: "RootQueryType";
  instanceVariables: {
    __typename?: "InstanceVariables";
    specs: {
      __typename?: "InstanceSpecs";
      specCurrency: { __typename?: "ResourceSpecification"; id: string; name: string };
      specProjectDesign: { __typename?: "ResourceSpecification"; id: string; name: string };
      specProjectProduct: { __typename?: "ResourceSpecification"; id: string; name: string };
      specProjectService: { __typename?: "ResourceSpecification"; id: string; name: string };
    };
    units: { __typename?: "InstanceUnits"; unitOne: { __typename?: "Unit"; id: string } };
  };
};

export type CreateProposalMutationVariables = Exact<{
  name: Scalars["String"];
  note: Scalars["String"];
}>;

export type CreateProposalMutation = {
  __typename?: "RootMutationType";
  createProposal: { __typename?: "ProposalResponse"; proposal: { __typename?: "Proposal"; id: string } };
};

export type CreateIntentMutationVariables = Exact<{
  agent: Scalars["ID"];
  resource: Scalars["ID"];
  oneUnit: Scalars["ID"];
  currency: Scalars["ID"];
  howMuch: Scalars["Decimal"];
}>;

export type CreateIntentMutation = {
  __typename?: "RootMutationType";
  item: { __typename?: "IntentResponse"; intent: { __typename?: "Intent"; id: string } };
  payment: { __typename?: "IntentResponse"; intent: { __typename?: "Intent"; id: string } };
};

export type LinkProposalAndIntentMutationVariables = Exact<{
  proposal: Scalars["ID"];
  item: Scalars["ID"];
  payment: Scalars["ID"];
}>;

export type LinkProposalAndIntentMutation = {
  __typename?: "RootMutationType";
  linkItem: { __typename?: "ProposedIntentResponse"; proposedIntent: { __typename?: "ProposedIntent"; id: string } };
  linkPayment: { __typename?: "ProposedIntentResponse"; proposedIntent: { __typename?: "ProposedIntent"; id: string } };
};

export type CreateLocationMutationVariables = Exact<{
  name: Scalars["String"];
  addr: Scalars["String"];
  lat: Scalars["Decimal"];
  lng: Scalars["Decimal"];
}>;

export type CreateLocationMutation = {
  __typename?: "RootMutationType";
  createSpatialThing: {
    __typename?: "SpatialThingResponse";
    spatialThing: { __typename?: "SpatialThing"; id: string; lat?: any | null; long?: any | null };
  };
};

export type CreateProjectMutationVariables = Exact<{
  name: Scalars["String"];
  note: Scalars["String"];
  metadata?: InputMaybe<Scalars["JSONObject"]>;
  agent: Scalars["ID"];
  creationTime: Scalars["DateTime"];
  location?: InputMaybe<Scalars["ID"]>;
  tags?: InputMaybe<Array<Scalars["URI"]> | Scalars["URI"]>;
  resourceSpec: Scalars["ID"];
  oneUnit: Scalars["ID"];
  images?: InputMaybe<Array<IFile> | IFile>;
  repo?: InputMaybe<Scalars["String"]>;
  process: Scalars["ID"];
  license: Scalars["String"];
}>;

export type CreateProjectMutation = {
  __typename?: "RootMutationType";
  createEconomicEvent: {
    __typename?: "EconomicEventResponse";
    economicEvent: {
      __typename?: "EconomicEvent";
      id: string;
      resourceInventoriedAs?: { __typename?: "EconomicResource"; id: string; name: string } | null;
    };
  };
};

export type TransferProjectMutationVariables = Exact<{
  resource: Scalars["ID"];
  name: Scalars["String"];
  note: Scalars["String"];
  metadata?: InputMaybe<Scalars["JSONObject"]>;
  agent: Scalars["ID"];
  creationTime: Scalars["DateTime"];
  location: Scalars["ID"];
  tags?: InputMaybe<Array<Scalars["URI"]> | Scalars["URI"]>;
  oneUnit: Scalars["ID"];
}>;

export type TransferProjectMutation = {
  __typename?: "RootMutationType";
  createEconomicEvent: {
    __typename?: "EconomicEventResponse";
    economicEvent: {
      __typename?: "EconomicEvent";
      id: string;
      toResourceInventoriedAs?: { __typename?: "EconomicResource"; id: string; name: string } | null;
    };
  };
};

export type GetResourceTableQueryVariables = Exact<{
  id: Scalars["ID"];
}>;

export type GetResourceTableQuery = {
  __typename?: "RootQueryType";
  economicResource?: {
    __typename?: "EconomicResource";
    id: string;
    name: string;
    note?: string | null;
    metadata?: any | null;
    license?: string | null;
    repo?: string | null;
    classifiedAs?: Array<any> | null;
    conformsTo: { __typename?: "ResourceSpecification"; id: string; name: string };
    onhandQuantity: {
      __typename?: "Measure";
      hasNumericalValue: any;
      hasUnit?: { __typename?: "Unit"; id: string; symbol: string; label: string } | null;
    };
    accountingQuantity: {
      __typename?: "Measure";
      hasNumericalValue: any;
      hasUnit?: { __typename?: "Unit"; label: string; symbol: string } | null;
    };
    primaryAccountable:
      | { __typename?: "Organization"; id: string; name: string }
      | { __typename?: "Person"; id: string; name: string };
    currentLocation?: { __typename?: "SpatialThing"; id: string; name: string; mappableAddress?: string | null } | null;
    images?: Array<{ __typename?: "File"; hash: any; name: string; mimeType: string; bin?: any | null }> | null;
  } | null;
};

export type GetProjectTypesQueryVariables = Exact<{ [key: string]: never }>;

export type GetProjectTypesQuery = {
  __typename?: "RootQueryType";
  instanceVariables: {
    __typename?: "InstanceVariables";
    specs: {
      __typename?: "InstanceSpecs";
      specProjectDesign: { __typename?: "ResourceSpecification"; id: string; name: string };
      specProjectProduct: { __typename?: "ResourceSpecification"; id: string; name: string };
      specProjectService: { __typename?: "ResourceSpecification"; id: string; name: string };
    };
  };
};

export type GetAgentQueryVariables = Exact<{
  first?: InputMaybe<Scalars["Int"]>;
  id?: InputMaybe<Scalars["ID"]>;
}>;

export type GetAgentQuery = {
  __typename?: "RootQueryType";
  agents?: {
    __typename?: "AgentConnection";
    pageInfo: {
      __typename?: "PageInfo";
      startCursor?: string | null;
      endCursor?: string | null;
      hasPreviousPage: boolean;
      hasNextPage: boolean;
      totalCount?: number | null;
      pageLimit?: number | null;
    };
    edges: Array<{
      __typename?: "AgentEdge";
      cursor: string;
      node:
        | { __typename?: "Organization"; id: string; name: string }
        | { __typename?: "Person"; id: string; name: string };
    }>;
  } | null;
};

export type GetAgentsQueryVariables = Exact<{
  userOrName: Scalars["String"];
  last?: InputMaybe<Scalars["Int"]>;
}>;

export type GetAgentsQuery = {
  __typename?: "RootQueryType";
  people?: {
    __typename?: "PersonConnection";
    pageInfo: {
      __typename?: "PageInfo";
      startCursor?: string | null;
      endCursor?: string | null;
      hasPreviousPage: boolean;
      hasNextPage: boolean;
      totalCount?: number | null;
      pageLimit?: number | null;
    };
    edges: Array<{
      __typename?: "PersonEdge";
      cursor: string;
      node: {
        __typename?: "Person";
        id: string;
        name: string;
        note?: string | null;
        primaryLocation?: { __typename?: "SpatialThing"; id: string; name: string } | null;
      };
    }>;
  } | null;
};

export type GetProjectsQueryVariables = Exact<{
  first?: InputMaybe<Scalars["Int"]>;
  after?: InputMaybe<Scalars["ID"]>;
  last?: InputMaybe<Scalars["Int"]>;
  before?: InputMaybe<Scalars["ID"]>;
  filter?: InputMaybe<ProposalFilterParams>;
}>;

export type GetProjectsQuery = {
  __typename?: "RootQueryType";
  proposals: {
    __typename?: "ProposalConnection";
    pageInfo: {
      __typename?: "PageInfo";
      startCursor?: string | null;
      endCursor?: string | null;
      hasPreviousPage: boolean;
      hasNextPage: boolean;
      totalCount?: number | null;
      pageLimit?: number | null;
    };
    edges: Array<{
      __typename?: "ProposalEdge";
      cursor: string;
      node: {
        __typename?: "Proposal";
        id: string;
        name?: string | null;
        created: any;
        primaryIntents?: Array<{
          __typename?: "Intent";
          resourceClassifiedAs?: Array<any> | null;
          hasPointInTime?: any | null;
          hasBeginning?: any | null;
          hasEnd?: any | null;
          action: { __typename?: "Action"; id: string };
          resourceInventoriedAs?: {
            __typename?: "EconomicResource";
            classifiedAs?: Array<any> | null;
            name: string;
            id: string;
            note?: string | null;
            metadata?: any | null;
            conformsTo: { __typename?: "ResourceSpecification"; name: string };
            primaryAccountable:
              | { __typename?: "Organization"; name: string; id: string }
              | { __typename?: "Person"; name: string; id: string };
            onhandQuantity: { __typename?: "Measure"; hasUnit?: { __typename?: "Unit"; label: string } | null };
            images?: Array<{ __typename?: "File"; hash: any; name: string; mimeType: string; bin?: any | null }> | null;
          } | null;
        }> | null;
        reciprocalIntents?: Array<{
          __typename?: "Intent";
          resourceQuantity?: {
            __typename?: "Measure";
            hasNumericalValue: any;
            hasUnit?: { __typename?: "Unit"; label: string; symbol: string } | null;
          } | null;
        }> | null;
      };
    }>;
  };
};

export type GetUnitAndCurrencyQueryVariables = Exact<{ [key: string]: never }>;

export type GetUnitAndCurrencyQuery = {
  __typename?: "RootQueryType";
  instanceVariables: {
    __typename?: "InstanceVariables";
    units: { __typename?: "InstanceUnits"; unitOne: { __typename?: "Unit"; id: string } };
    specs: { __typename?: "InstanceSpecs"; specCurrency: { __typename?: "ResourceSpecification"; id: string } };
  };
};

export type GetUserQueryVariables = Exact<{
  id: Scalars["ID"];
}>;

export type GetUserQuery = {
  __typename?: "RootQueryType";
  person?: {
    __typename?: "Person";
    id: string;
    name: string;
    email: string;
    user: string;
    ethereumAddress?: string | null;
    primaryLocation?: { __typename?: "SpatialThing"; name: string; mappableAddress?: string | null } | null;
  } | null;
};

export type FetchInventoryQueryVariables = Exact<{
  first?: InputMaybe<Scalars["Int"]>;
  after?: InputMaybe<Scalars["ID"]>;
  last?: InputMaybe<Scalars["Int"]>;
  before?: InputMaybe<Scalars["ID"]>;
  filter?: InputMaybe<EconomicResourceFilterParams>;
}>;

export type FetchInventoryQuery = {
  __typename?: "RootQueryType";
  economicResources?: {
    __typename?: "EconomicResourceConnection";
    pageInfo: {
      __typename?: "PageInfo";
      startCursor?: string | null;
      endCursor?: string | null;
      hasPreviousPage: boolean;
      hasNextPage: boolean;
      totalCount?: number | null;
      pageLimit?: number | null;
    };
    edges: Array<{
      __typename?: "EconomicResourceEdge";
      cursor: string;
      node: {
        __typename?: "EconomicResource";
        id: string;
        name: string;
        classifiedAs?: Array<any> | null;
        note?: string | null;
        metadata?: any | null;
        okhv?: string | null;
        repo?: string | null;
        version?: string | null;
        licensor?: string | null;
        license?: string | null;
        conformsTo: { __typename?: "ResourceSpecification"; id: string; name: string };
        currentLocation?: {
          __typename?: "SpatialThing";
          id: string;
          name: string;
          mappableAddress?: string | null;
          lat?: any | null;
          long?: any | null;
        } | null;
        images?: Array<{ __typename?: "File"; hash: any; name: string; mimeType: string; bin?: any | null }> | null;
        primaryAccountable:
          | {
              __typename?: "Organization";
              id: string;
              name: string;
              note?: string | null;
              primaryLocation?: { __typename?: "SpatialThing"; name: string } | null;
            }
          | {
              __typename?: "Person";
              id: string;
              name: string;
              note?: string | null;
              primaryLocation?: { __typename?: "SpatialThing"; name: string } | null;
            };
        custodian:
          | { __typename?: "Organization"; id: string; name: string; note?: string | null }
          | { __typename?: "Person"; id: string; name: string; note?: string | null };
        accountingQuantity: {
          __typename?: "Measure";
          hasNumericalValue: any;
          hasUnit?: { __typename?: "Unit"; id: string; label: string; symbol: string } | null;
        };
        onhandQuantity: {
          __typename?: "Measure";
          hasNumericalValue: any;
          hasUnit?: { __typename?: "Unit"; id: string; label: string; symbol: string } | null;
        };
      };
    }>;
  } | null;
};

export type GetResourceDetailsQueryVariables = Exact<{
  id: Scalars["ID"];
}>;

export type GetResourceDetailsQuery = {
  __typename?: "RootQueryType";
  proposal?: {
    __typename?: "Proposal";
    created: any;
    primaryIntents?: Array<{
      __typename?: "Intent";
      hasPointInTime?: any | null;
      resourceInventoriedAs?: {
        __typename?: "EconomicResource";
        name: string;
        id: string;
        note?: string | null;
        classifiedAs?: Array<any> | null;
        metadata?: any | null;
        conformsTo: { __typename?: "ResourceSpecification"; name: string; id: string };
        currentLocation?: { __typename?: "SpatialThing"; name: string } | null;
        primaryAccountable:
          | { __typename?: "Organization"; name: string; id: string }
          | { __typename?: "Person"; name: string; id: string };
        onhandQuantity: { __typename?: "Measure"; hasUnit?: { __typename?: "Unit"; label: string } | null };
        images?: Array<{ __typename?: "File"; hash: any; name: string; mimeType: string; bin?: any | null }> | null;
      } | null;
    }> | null;
  } | null;
};

export type CreateProcessMutationVariables = Exact<{
  name: Scalars["String"];
}>;

export type CreateProcessMutation = {
  __typename?: "RootMutationType";
  createProcess: { __typename?: "ProcessResponse"; process: { __typename?: "Process"; id: string } };
};

export type ForkProjectMutationVariables = Exact<{
  agent: Scalars["ID"];
  creationTime: Scalars["DateTime"];
  resource: Scalars["ID"];
  process: Scalars["ID"];
  unitOne: Scalars["ID"];
  tags?: InputMaybe<Array<Scalars["URI"]> | Scalars["URI"]>;
  location?: InputMaybe<Scalars["ID"]>;
  spec: Scalars["ID"];
  name: Scalars["String"];
  note?: InputMaybe<Scalars["String"]>;
  repo?: InputMaybe<Scalars["String"]>;
  metadata?: InputMaybe<Scalars["JSONObject"]>;
}>;

export type ForkProjectMutation = {
  __typename?: "RootMutationType";
  cite: { __typename?: "EconomicEventResponse"; economicEvent: { __typename?: "EconomicEvent"; id: string } };
  produce: {
    __typename?: "EconomicEventResponse";
    economicEvent: {
      __typename?: "EconomicEvent";
      id: string;
      resourceInventoriedAs?: { __typename?: "EconomicResource"; id: string; name: string } | null;
    };
  };
};

export type ProposeContributionMutationVariables = Exact<{
  process: Scalars["ID"];
  owner: Scalars["ID"];
  proposer: Scalars["ID"];
  creationTime: Scalars["DateTime"];
  resourceForked: Scalars["ID"];
  unitOne: Scalars["ID"];
  resourceOrigin: Scalars["ID"];
}>;

export type ProposeContributionMutation = {
  __typename?: "RootMutationType";
  citeResourceForked: { __typename?: "IntentResponse"; intent: { __typename?: "Intent"; id: string } };
  acceptResourceOrigin: { __typename?: "IntentResponse"; intent: { __typename?: "Intent"; id: string } };
  modifyResourceOrigin: { __typename?: "IntentResponse"; intent: { __typename?: "Intent"; id: string } };
};

export type LinkContributionAndProposalAndIntentMutationVariables = Exact<{
  proposal: Scalars["ID"];
  citeIntent: Scalars["ID"];
  acceptIntent: Scalars["ID"];
  modifyIntent: Scalars["ID"];
}>;

export type LinkContributionAndProposalAndIntentMutation = {
  __typename?: "RootMutationType";
  proposeCite: { __typename?: "ProposedIntentResponse"; proposedIntent: { __typename?: "ProposedIntent"; id: string } };
  proposeAccept: {
    __typename?: "ProposedIntentResponse";
    proposedIntent: { __typename?: "ProposedIntent"; id: string };
  };
  proposeModify: {
    __typename?: "ProposedIntentResponse";
    proposedIntent: { __typename?: "ProposedIntent"; id: string };
  };
};

export type QueryProposalQueryVariables = Exact<{
  id: Scalars["ID"];
}>;

export type QueryProposalQuery = {
  __typename?: "RootQueryType";
  proposal?: {
    __typename?: "Proposal";
    id: string;
    name?: string | null;
    note?: string | null;
    status: ProposedStatus;
    primaryIntents?: Array<{
      __typename?: "Intent";
      id: string;
      hasPointInTime?: any | null;
      provider?:
        | { __typename?: "Organization"; id: string; name: string }
        | { __typename?: "Person"; id: string; name: string }
        | null;
      receiver?:
        | { __typename?: "Organization"; id: string; name: string }
        | { __typename?: "Person"; id: string; name: string }
        | null;
      inputOf?: { __typename?: "Process"; name: string; id: string } | null;
      outputOf?: { __typename?: "Process"; id: string; name: string } | null;
      resourceInventoriedAs?: {
        __typename?: "EconomicResource";
        id: string;
        name: string;
        repo?: string | null;
        metadata?: any | null;
        primaryAccountable:
          | { __typename?: "Organization"; id: string; name: string }
          | { __typename?: "Person"; id: string; name: string };
        onhandQuantity: {
          __typename?: "Measure";
          hasNumericalValue: any;
          hasUnit?: { __typename?: "Unit"; id: string } | null;
        };
      } | null;
      resourceConformsTo?: { __typename?: "ResourceSpecification"; id: string; name: string } | null;
    }> | null;
  } | null;
};

export type CiteProjectMutationVariables = Exact<{
  agent: Scalars["ID"];
  creationTime: Scalars["DateTime"];
  resource: Scalars["ID"];
  process: Scalars["ID"];
  unitOne: Scalars["ID"];
}>;

export type CiteProjectMutation = {
  __typename?: "RootMutationType";
  createEconomicEvent: {
    __typename?: "EconomicEventResponse";
    economicEvent: { __typename?: "EconomicEvent"; id: string };
  };
};

export type ContributeToProjectMutationVariables = Exact<{
  agent: Scalars["ID"];
  creationTime: Scalars["DateTime"];
  process: Scalars["ID"];
  unitOne: Scalars["ID"];
  conformsTo: Scalars["ID"];
}>;

export type ContributeToProjectMutation = {
  __typename?: "RootMutationType";
  createEconomicEvent: {
    __typename?: "EconomicEventResponse";
    economicEvent: { __typename?: "EconomicEvent"; id: string };
  };
};

export type AcceptProposalMutationVariables = Exact<{
  process: Scalars["ID"];
  owner: Scalars["ID"];
  proposer: Scalars["ID"];
  unitOne: Scalars["ID"];
  resourceForked: Scalars["ID"];
  resourceOrigin: Scalars["ID"];
  creationTime: Scalars["DateTime"];
  metadata?: InputMaybe<Scalars["JSONObject"]>;
}>;

export type AcceptProposalMutation = {
  __typename?: "RootMutationType";
  cite: { __typename?: "EconomicEventResponse"; economicEvent: { __typename?: "EconomicEvent"; id: string } };
  accept: { __typename?: "EconomicEventResponse"; economicEvent: { __typename?: "EconomicEvent"; id: string } };
  modify: { __typename?: "EconomicEventResponse"; economicEvent: { __typename?: "EconomicEvent"; id: string } };
};

export type SatisfyIntentsMutationVariables = Exact<{
  unitOne: Scalars["ID"];
  intentCited: Scalars["ID"];
  intentAccepted: Scalars["ID"];
  intentModify: Scalars["ID"];
  eventCite: Scalars["ID"];
  eventAccept: Scalars["ID"];
  eventModify: Scalars["ID"];
}>;

export type SatisfyIntentsMutation = {
  __typename?: "RootMutationType";
  cite: { __typename?: "SatisfactionResponse"; satisfaction: { __typename?: "Satisfaction"; id: string } };
  accept: { __typename?: "SatisfactionResponse"; satisfaction: { __typename?: "Satisfaction"; id: string } };
  modify: { __typename?: "SatisfactionResponse"; satisfaction: { __typename?: "Satisfaction"; id: string } };
};

export type RejectProposalMutationVariables = Exact<{
  intentCite: Scalars["ID"];
  intentAccept: Scalars["ID"];
  intentModify: Scalars["ID"];
}>;

export type RejectProposalMutation = {
  __typename?: "RootMutationType";
  cite: { __typename?: "IntentResponse"; intent: { __typename?: "Intent"; id: string } };
  accept: { __typename?: "IntentResponse"; intent: { __typename?: "Intent"; id: string } };
  modify: { __typename?: "IntentResponse"; intent: { __typename?: "Intent"; id: string } };
};

export type AskResourcePrimaryAccountableQueryVariables = Exact<{
  id: Scalars["ID"];
}>;

export type AskResourcePrimaryAccountableQuery = {
  __typename?: "RootQueryType";
  economicResource?: {
    __typename?: "EconomicResource";
    name: string;
    primaryAccountable:
      | { __typename?: "Organization"; id: string; name: string }
      | { __typename?: "Person"; id: string; name: string };
  } | null;
};

export type ResourceProposalsQueryVariables = Exact<{
  id: Scalars["ID"];
}>;

export type ResourceProposalsQuery = {
  __typename?: "RootQueryType";
  proposals: {
    __typename?: "ProposalConnection";
    edges: Array<{
      __typename?: "ProposalEdge";
      node: {
        __typename?: "Proposal";
        id: string;
        status: ProposedStatus;
        note?: string | null;
        created: any;
        primaryIntents?: Array<{
          __typename?: "Intent";
          provider?:
            | { __typename?: "Organization"; id: string; name: string }
            | { __typename?: "Person"; id: string; name: string }
            | null;
        }> | null;
      };
    }>;
  };
};

export type ClaimDidMutationVariables = Exact<{
  id: Scalars["ID"];
}>;

export type ClaimDidMutation = { __typename?: "RootMutationType"; claimPerson: any };

export type UpdateMetadataMutationVariables = Exact<{
  process: Scalars["ID"];
  agent: Scalars["ID"];
  resource: Scalars["ID"];
  quantity: IMeasure;
  now: Scalars["DateTime"];
  metadata: Scalars["JSONObject"];
}>;

export type UpdateMetadataMutation = {
  __typename?: "RootMutationType";
  accept: { __typename?: "EconomicEventResponse"; economicEvent: { __typename?: "EconomicEvent"; id: string } };
  modify: { __typename?: "EconomicEventResponse"; economicEvent: { __typename?: "EconomicEvent"; id: string } };
};

export type UpdateContributionMutationVariables = Exact<{
  process: Scalars["ID"];
  agent: Scalars["ID"];
  resource: Scalars["ID"];
  quantity: IMeasure;
  now: Scalars["DateTime"];
  metadata: Scalars["JSONObject"];
  conformsTo: Scalars["ID"];
  unitOne: Scalars["ID"];
}>;

export type UpdateContributionMutation = {
  __typename?: "RootMutationType";
  contribute: { __typename?: "EconomicEventResponse"; economicEvent: { __typename?: "EconomicEvent"; id: string } };
};

export type QueryProjectForMetadataUpdateQueryVariables = Exact<{
  id: Scalars["ID"];
}>;

export type QueryProjectForMetadataUpdateQuery = {
  __typename?: "RootQueryType";
  economicResource?: {
    __typename?: "EconomicResource";
    id: string;
    name: string;
    metadata?: any | null;
    onhandQuantity: {
      __typename?: "Measure";
      hasNumericalValue: any;
      hasUnit?: { __typename?: "Unit"; id: string; symbol: string; label: string } | null;
    };
    accountingQuantity: {
      __typename?: "Measure";
      hasNumericalValue: any;
      hasUnit?: { __typename?: "Unit"; id: string; label: string; symbol: string } | null;
    };
    primaryAccountable: { __typename?: "Organization"; id: string } | { __typename?: "Person"; id: string };
  } | null;
};

export type RelocateProjectMutationVariables = Exact<{
  process: Scalars["ID"];
  agent: Scalars["ID"];
  resource: Scalars["ID"];
  quantity: IMeasure;
  now: Scalars["DateTime"];
  location: Scalars["ID"];
}>;

export type RelocateProjectMutation = {
  __typename?: "RootMutationType";
  pickup: { __typename?: "EconomicEventResponse"; economicEvent: { __typename?: "EconomicEvent"; id: string } };
  dropoff: { __typename?: "EconomicEventResponse"; economicEvent: { __typename?: "EconomicEvent"; id: string } };
};

export type EditMainMutationVariables = Exact<{
  id: Scalars["ID"];
  classifiedAs?: InputMaybe<Array<Scalars["URI"]> | Scalars["URI"]>;
  note?: InputMaybe<Scalars["String"]>;
  name?: InputMaybe<Scalars["String"]>;
  repo?: InputMaybe<Scalars["String"]>;
}>;

export type EditMainMutation = {
  __typename?: "RootMutationType";
  updateEconomicResource: {
    __typename?: "EconomicResourceResponse";
    economicResource: { __typename?: "EconomicResource"; id: string };
  };
};
